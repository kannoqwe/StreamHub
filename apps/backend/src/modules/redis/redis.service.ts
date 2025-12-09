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

    async set(key: string, value: string, ttlInSeconds: number): Promise<void> {
        await this._client.set(key, value, 'EX', ttlInSeconds);
    }

    async get(key: string): Promise<string | null> {
        return this._client.get(key);
    }

    async delete(key: string): Promise<number> {
        return this._client.del(key);
    }
}
