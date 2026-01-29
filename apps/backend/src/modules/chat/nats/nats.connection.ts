import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, NatsConnection } from 'nats';

@Injectable()
export class NatsConnectionProvider implements OnModuleDestroy {
    private readonly logger = new Logger(NatsConnectionProvider.name);
    private readonly url: string;
    private nc?: NatsConnection;

    constructor(private cfg: ConfigService) {
        this.url = cfg.get<string>('nats.url')!;
    }

    async get(): Promise<NatsConnection> {
        if (this.nc) return this.nc;

        this.logger.log(`connecting to NATS: ${this.url}`);
        this.nc = await connect({
            servers: this.url,
            name: this.cfg.get('nats.queueGroup'),
            reconnect: true,
            maxReconnectAttempts: -1,
        });

        this.logger.log('connected to NATS');
        return this.nc;
    }

    async onModuleDestroy() {
        if (!this.nc) return;
        this.logger.log('draining NATS connection...');
        await this.nc.drain().catch(() => undefined);
        await this.nc.close().catch(() => undefined);
        this.logger.log('NATS connection closed');
    }
}
