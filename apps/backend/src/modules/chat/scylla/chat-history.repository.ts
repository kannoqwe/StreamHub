import {
    Injectable,
    Logger,
    OnApplicationBootstrap,
    OnApplicationShutdown,
} from '@nestjs/common';
import { types } from 'cassandra-driver';
import { setTimeout as delay } from 'node:timers/promises';

import { ChatIngestEvent } from '@modules/chat/types/chat-ingest.event';
import { ScyllaService } from '@modules/scylla/scylla.service';
import Row = types.Row;

interface UserChannelHistoryRow {
    streamer_id: number;
    user_id: number;
    message_id: string;
    username: string;
    content: string;
    ts: types.TimeUuid;
}

@Injectable()
export class ChatHistoryRepository
    implements OnApplicationBootstrap, OnApplicationShutdown
{
    private readonly logger = new Logger(ChatHistoryRepository.name);
    private readonly maxBatch = 100;
    private readonly flushIntervalMs = 200;
    private readonly queueSize = 1000;

    constructor(private readonly scylla: ScyllaService) {}

    private queue?: {
        ch: Channel<ChatIngestEvent>;
        stop: () => void;
    };

    onApplicationBootstrap() {
        this.startQueue();
    }

    async onApplicationShutdown() {
        await this.stopQueue();
    }

    private eventTimeUuid(ts: string): types.TimeUuid {
        const date = new Date(ts);
        if (Number.isNaN(date.getTime())) {
            this.logger.warn('invalid timestamp, using now()');
            return types.TimeUuid.now();
        }
        return types.TimeUuid.fromDate(date);
    }

    async enqueue(event: ChatIngestEvent): Promise<void> {
        this.startQueue();

        if (!this.queue) return;

        const ok = this.queue.ch.trySend(event);
        if (ok) return;

        const sent = await this.queue.ch.send(event, 50);
        if (!sent) {
            this.logger.warn('scylla queue full, dropping event');
        }
    }

    async append(event: ChatIngestEvent): Promise<void> {
        await this.flushBatch([event]);
    }

    private async flushBatch(events: ChatIngestEvent[]): Promise<void> {
        if (events.length === 0) return;

        const queries = events.flatMap((event) => {
            const ts = this.eventTimeUuid(event.timestamp);
            return [
                {
                    query: 'INSERT INTO chat_log (streamer_id, ts, message_id, user_id, username, content) VALUES (?, ?, ?, ?, ?, ?)',
                    params: [
                        event.streamer_id,
                        ts,
                        event.message_id,
                        event.user_id,
                        event.username,
                        event.content,
                    ],
                },
                {
                    query: 'INSERT INTO user_channel_history (streamer_id, user_id, ts, message_id, username, content) VALUES (?, ?, ?, ?, ?, ?)',
                    params: [
                        event.streamer_id,
                        event.user_id,
                        ts,
                        event.message_id,
                        event.username,
                        event.content,
                    ],
                },
            ];
        });

        const client = await this.scylla.getClient();
        await client.batch(queries, { prepare: true });
    }

    async fetchUserHistory(
        streamerId: number,
        userId: number,
        limit: number,
        before?: string,
    ): Promise<ChatIngestEvent[]> {
        const safeLimit = Math.min(Math.max(limit || 100, 1), 200);

        let query =
            'SELECT streamer_id, user_id, message_id, username, content, ts FROM user_channel_history WHERE streamer_id = ? AND user_id = ?';
        const params: Array<number | types.TimeUuid> = [streamerId, userId];

        if (before) {
            const date = new Date(before);
            if (!Number.isNaN(date.getTime())) {
                query += ' AND ts < ?';
                params.push(types.TimeUuid.fromDate(date));
            }
        }

        query += ' ORDER BY ts DESC LIMIT ?';
        params.push(safeLimit);

        const res = await this.scylla.execute(query, params);

        return res.rows.map((row: Row) => {
            const r = row as unknown as UserChannelHistoryRow;

            return {
                message_id: r.message_id,
                streamer_id: r.streamer_id,
                user_id: r.user_id,
                username: r.username,
                content: r.content,
                timestamp: r.ts.getDate().toISOString(),
            };
        });
    }

    private startQueue() {
        if (this.queue) return;

        const ch = new Channel<ChatIngestEvent>(this.queueSize);
        let stop = false;

        const loop = async () => {
            const buf: ChatIngestEvent[] = [];
            let lastFlush = Date.now();

            for (;;) {
                if (stop) break;

                const wait = this.flushIntervalMs - (Date.now() - lastFlush);
                const timeout = Math.max(wait, 0);

                const item = await ch.recv(timeout);
                if (item) {
                    buf.push(item);
                }

                const shouldFlush =
                    buf.length >= this.maxBatch ||
                    (buf.length > 0 &&
                        Date.now() - lastFlush >= this.flushIntervalMs);

                if (shouldFlush) {
                    const batch = buf.splice(0, buf.length);
                    try {
                        await this.flushBatch(batch);
                    } catch (err) {
                        this.logger.error(`scylla batch flush failed: ${err}`);
                    }
                    lastFlush = Date.now();
                }
            }

            const drain: ChatIngestEvent[] = [];
            for (;;) {
                const item = ch.tryRecv();
                if (!item) break;
                drain.push(item);
                if (drain.length >= this.maxBatch) break;
            }
            if (drain.length > 0) {
                try {
                    await this.flushBatch(drain);
                } catch (err) {
                    this.logger.error(`scylla drain failed: ${err}`);
                }
            }
        };

        loop().catch((err) => {
            this.logger.error(`scylla queue loop crashed: ${err}`);
        });

        this.queue = {
            ch,
            stop: () => {
                stop = true;
            },
        };
    }

    private async stopQueue(): Promise<void> {
        if (!this.queue) return;
        this.queue.stop();
        await delay(10);
        this.queue = undefined;
    }
}

class Channel<T> {
    private readonly buf: T[] = [];
    private readonly size: number;
    private readonly waiters: Array<(v: T | undefined) => void> = [];

    constructor(size: number) {
        this.size = size;
    }

    trySend(item: T): boolean {
        if (this.waiters.length > 0) {
            const w = this.waiters.shift()!;
            w(item);
            return true;
        }
        if (this.buf.length >= this.size) return false;
        this.buf.push(item);
        return true;
    }

    async send(item: T, timeoutMs: number): Promise<boolean> {
        if (this.trySend(item)) return true;

        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            await new Promise((resolve) => setTimeout(resolve, 5));
            if (this.trySend(item)) return true;
        }
        return false;
    }

    tryRecv(): T | undefined {
        return this.buf.shift();
    }

    recv(timeoutMs: number): Promise<T | undefined> {
        const immediate = this.tryRecv();
        if (immediate !== undefined) return Promise.resolve(immediate);

        return new Promise((resolve) => {
            const timer =
                timeoutMs > 0
                    ? setTimeout(() => {
                          const idx = this.waiters.indexOf(resolve);
                          if (idx >= 0) this.waiters.splice(idx, 1);
                          resolve(undefined);
                      }, timeoutMs)
                    : null;

            this.waiters.push((v) => {
                if (timer) clearTimeout(timer);
                resolve(v);
            });
        });
    }
}
