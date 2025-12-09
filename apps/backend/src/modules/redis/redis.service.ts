import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {}

    onModuleDestroy() {
        this.client.disconnect();
    }

    async set(key: string, value: string, ttlInSeconds: number): Promise<void> {
        await this.client.set(key, value, 'EX', ttlInSeconds);
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async delete(key: string): Promise<number> {
        return this.client.del(key);
    }
}
