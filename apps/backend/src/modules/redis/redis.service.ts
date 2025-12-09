import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    constructor(@Inject('REDIS_CLIENT') private readonly _client: Redis) {}

    get client() {
        return this._client;
    }

    onModuleDestroy() {
        this._client.disconnect();
    }

    async set<T = string>(
        key: string,
        value: T,
        ttlInSeconds?: number,
    ): Promise<void> {
        const data = typeof value === 'string' ? value : JSON.stringify(value);

        if (!ttlInSeconds || ttlInSeconds <= 0) {
            await this._client.set(key, data);
            return;
        }

        await this._client.set(key, data, 'EX', ttlInSeconds);
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this._client.get(key);
        return data ? (JSON.parse(data) as T) : null;
    }

    async delete(key: string): Promise<number> {
        return this._client.del(key);
    }
}
