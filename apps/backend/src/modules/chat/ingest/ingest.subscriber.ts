import {
    Injectable,
    Logger,
    OnApplicationBootstrap,
    OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { consumerOpts, createInbox, StringCodec } from 'nats';

import { ChatIngestEvent } from '../types/chat-ingest.event';
import { IngestUseCase } from './ingest.usecase';
import { NatsConnectionProvider } from '@modules/chat/nats/nats.connection';
import { IngestTransport } from '../types/ingest.transport';

@Injectable()
export class IngestSubscriberService
    implements IngestTransport, OnApplicationBootstrap, OnApplicationShutdown
{
    private readonly logger = new Logger(IngestSubscriberService.name);
    private readonly sc = StringCodec();

    private readonly ingestSubject: string;
    private readonly queueGroup: string;

    private started = false;
    private stopRequested = false;
    private subscription?: { unsubscribe: () => void };

    constructor(
        private readonly nats: NatsConnectionProvider,
        private readonly cfg: ConfigService,
        private readonly useCase: IngestUseCase,
    ) {
        this.ingestSubject = this.cfg.get('nats.ingestSubject')!;
        this.queueGroup = this.cfg.get('nats.queueGroup')!;
    }

    async onApplicationBootstrap() {
        await this.start();
    }

    async onApplicationShutdown() {
        await this.stop();
    }

    async start(): Promise<void> {
        if (this.started) return;
        this.started = true;
        this.stopRequested = false;

        const nc = await this.nats.get();
        const js = nc.jetstream();

        const opts = consumerOpts();
        opts.durable(this.queueGroup);
        opts.manualAck();
        opts.ackExplicit();
        opts.queue(this.queueGroup);
        opts.deliverTo(createInbox());
        opts.deliverNew();
        opts.ackWait(30_000);
        opts.maxDeliver(5);

        const sub = await js.subscribe(this.ingestSubject, opts);
        this.subscription = sub;

        this.logger.log(
            `subscribed subject=${this.ingestSubject} queue=${this.queueGroup}`,
        );

        (async () => {
            for await (const msg of sub) {
                if (this.stopRequested) break;

                try {
                    const raw = this.sc.decode(msg.data);
                    const ev = JSON.parse(raw) as ChatIngestEvent;

                    if (!ev?.message_id || !ev.streamer_id || !ev.user_id) {
                        this.logger.warn('invalid event payload (missing ids)');
                        msg.ack();
                        continue;
                    }

                    await this.useCase.handle(ev);
                    msg.ack();
                } catch (err) {
                    this.logger.error(`failed to process message: ${err}`);
                    msg.nak();
                }
            }
        })().catch((err) => {
            this.logger.error(`subscriber loop crashed: ${err}`);
        });
    }

    stop(): Promise<void> {
        if (!this.started) return Promise.resolve();
        this.stopRequested = true;

        if (this.subscription) {
            this.logger.log('unsubscribing ingest subscriber...');
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }

        this.logger.log('ingest subscriber stopped');
        return Promise.resolve();
    }
}
