import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

    onModuleDestroy() {
        this.redis.disconnect();
    }

    async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T | null>,
        ttlInSeconds: number = 300,
    ): Promise<T | null> {
        const cached = await this.redis.get(key);
        if (cached) {
            return JSON.parse(cached) as T;
        }

        const data = await fetcher();

        if (data) {
            await this.redis.set(key, JSON.stringify(data), 'EX', ttlInSeconds);
        }

        return data;
    }

    async mdel(keys: string[]) {
        if (keys.length === 0) return;
        await this.redis.del(...keys);
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.redis.get(key);
        return data ? (JSON.parse(data) as T) : null;
    }

    async set(key: string, value: any, ttl: number = 300) {
        await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    }
}
