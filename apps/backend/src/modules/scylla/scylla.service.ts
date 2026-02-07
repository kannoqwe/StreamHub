import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, QueryOptions, types } from 'cassandra-driver';
import ResultSet = types.ResultSet;

type ExecOptions = Omit<QueryOptions, 'prepare'>;

@Injectable()
export class ScyllaService implements OnModuleDestroy {
    private readonly logger = new Logger(ScyllaService.name);
    private client?: Client;

    constructor(private readonly cfg: ConfigService) {}

    async getClient(): Promise<Client> {
        if (this.client) return this.client;

        const contactPointsRaw =
            this.cfg.get<string>('scylla.contactPoints') ?? 'scylla';
        const contactPoints = contactPointsRaw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        const localDataCenter =
            this.cfg.get<string>('scylla.localDatacenter') ?? 'datacenter1';
        const keyspace =
            this.cfg.get<string>('scylla.keyspace') ?? 'streamplatform';
        const port = this.cfg.get<number>('scylla.port') ?? 9042;

        this.client = new Client({
            contactPoints,
            localDataCenter,
            keyspace,
            protocolOptions: { port },
        });

        await this.client.connect();
        this.logger.log(`connected to Scylla keyspace=${keyspace}`);
        return this.client;
    }

    async execute(
        query: string,
        params: readonly unknown[] = [],
        options: ExecOptions = {},
    ): Promise<ResultSet> {
        const client = await this.getClient();

        return client.execute(query, params as unknown[], {
            ...options,
            prepare: true,
        });
    }

    async onModuleDestroy(): Promise<void> {
        if (!this.client) return;
        await this.client.shutdown().catch(() => undefined);
        this.logger.log('Scylla connection closed');
    }
}
