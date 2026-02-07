import { Injectable, Logger } from '@nestjs/common';
import { types } from 'cassandra-driver';

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
export class ChatHistoryRepository {
    private readonly logger = new Logger(ChatHistoryRepository.name);

    constructor(private readonly scylla: ScyllaService) {}

    private eventTimeUuid(ts: string): types.TimeUuid {
        const date = new Date(ts);
        if (Number.isNaN(date.getTime())) {
            this.logger.warn('invalid timestamp, using now()');
            return types.TimeUuid.now();
        }
        return types.TimeUuid.fromDate(date);
    }

    async append(event: ChatIngestEvent): Promise<void> {
        const ts = this.eventTimeUuid(event.timestamp);

        const queries = [
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
        const params: any[] = [streamerId, userId];

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
}
