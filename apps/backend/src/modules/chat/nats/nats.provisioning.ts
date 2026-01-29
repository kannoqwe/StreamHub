import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsConnectionProvider } from './nats.connection';
import { RetentionPolicy, StorageType } from 'nats';

@Injectable()
export class NatsProvisioningService implements OnApplicationBootstrap {
    private readonly logger = new Logger(NatsProvisioningService.name);

    constructor(
        private readonly cfg: ConfigService,
        private readonly nats: NatsConnectionProvider,
    ) {}

    async onApplicationBootstrap() {
        const nc = await this.nats.get();
        const jsm = await nc.jetstreamManager();

        const streamName = this.cfg.get<string>('nats.ingestStream')!;
        const ingestSubject = this.cfg.get<string>('nats.ingestSubject')!;

        try {
            await jsm.streams.info(streamName);
            this.logger.log(`JetStream stream exists: ${streamName}`);
            return;
        } catch {
            // stream not found -> create
        }

        this.logger.warn(
            `JetStream stream missing, creating: ${streamName} subject=${ingestSubject}`,
        );

        await jsm.streams.add({
            name: streamName,
            subjects: [ingestSubject],
            storage: StorageType.File,
            retention: RetentionPolicy.Limits,
            max_age: 7 * 24 * 60 * 60 * 1_000_000_000, // 7 days
            num_replicas: 1,
        });

        this.logger.log(`JetStream stream created: ${streamName}`);
    }
}
