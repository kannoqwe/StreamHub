import {
    Injectable,
    Logger,
    OnApplicationBootstrap,
    OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StringCodec } from 'nats';

import { ChatIngestEvent } from '../chat-ingest.event';
import { IngestUseCase } from '../application/ingest.usecase';
import { NatsConnectionProvider } from '../infrastructure/nats/nats.connection';
import { IngestTransport } from './ingest.transport';

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

        const sub = nc.subscribe(this.ingestSubject, {
            queue: this.queueGroup,
        });
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
                        continue;
                    }

                    await this.useCase.handle(ev);
                } catch (err) {
                    this.logger.error(`failed to process message: ${err}`);
                }
            }
        })().catch((err) => {
            this.logger.error(`subscriber loop crashed: ${err}`);
        });
    }

    async stop(): Promise<void> {
        if (!this.started) return;
        this.stopRequested = true;

        if (this.subscription) {
            this.logger.log('unsubscribing ingest subscriber...');
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }

        this.logger.log('ingest subscriber stopped');
    }
}
