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

    async set<T>(key: string, value: T, ttl: number = 300) {
        await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    }

    async delete(key: string): Promise<number> {
        return this.redis.del(key);
    }

    async lpushJson<T>(key: string, value: T): Promise<void> {
        await this.redis.lpush(key, JSON.stringify(value));
    }

    async ltrim(key: string, start: number, stop: number): Promise<void> {
        await this.redis.ltrim(key, start, stop);
    }

    async lrangeJson<T>(
        key: string,
        start: number,
        stop: number,
    ): Promise<T[]> {
        const items = await this.redis.lrange(key, start, stop);
        return items
            .map((s) => {
                try {
                    return JSON.parse(s) as T;
                } catch {
                    return null;
                }
            })
            .filter((x): x is T => x !== null);
    }

    async lpushTrimJson<T>(key: string, value: T, keep: number): Promise<void> {
        const multi = this.redis.multi();
        multi.lpush(key, JSON.stringify(value));
        multi.ltrim(key, 0, keep - 1);
        await multi.exec();
    }

    async lpushTrimExpireJson<T>(
        key: string,
        value: T,
        keep: number,
        ttlSeconds: number,
    ): Promise<void> {
        const multi = this.redis.multi();
        multi.lpush(key, JSON.stringify(value));
        multi.ltrim(key, 0, keep - 1);
        multi.expire(key, ttlSeconds);
        await multi.exec();
    }

    async zaddTrimJson<T>(
        key: string,
        score: number,
        value: T,
        keep: number,
        minScore: number,
    ): Promise<void> {
        const payload = JSON.stringify(value);
        const multi = this.redis.multi();
        multi.zadd(key, score.toString(), payload);
        multi.zremrangebyscore(key, 0, minScore);
        multi.zremrangebyrank(key, 0, -(keep + 1));
        await multi.exec();
    }

    async zrevrangeJson<T>(key: string, start: number, stop: number) {
        const items = await this.redis.zrevrange(key, start, stop);
        return items
            .map((s) => {
                try {
                    return JSON.parse(s) as T;
                } catch {
                    return null;
                }
            })
            .filter((x): x is T => x !== null);
    }

    async zrevrangeByScoreJson<T>(
        key: string,
        maxScore: number,
        minScore: number,
        limit: number,
    ): Promise<T[]> {
        const items = await this.redis.zrevrangebyscore(
            key,
            maxScore.toString(),
            minScore.toString(),
            'LIMIT',
            0,
            limit,
        );

        return items
            .map((s) => {
                try {
                    return JSON.parse(s) as T;
                } catch {
                    return null;
                }
            })
            .filter((x): x is T => x !== null);
    }

    async setIfNotExists(
        key: string,
        value: string,
        ttlSeconds: number,
    ): Promise<boolean> {
        const res = await this.redis.set(key, value, 'EX', ttlSeconds, 'NX');
        return res === 'OK';
    }
}
