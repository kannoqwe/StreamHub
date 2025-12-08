import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    constructor(private configService: ConfigService) {}

    async onModuleInit() {
        this.client = new Redis({
            host: this.configService.get<string>('redis.host'),
            port: this.configService.get<number>('redis.port'),
        });

        Logger.log('Redis initialized.', 'REDIS');
    }

    onModuleDestroy() {
        this.client.disconnect();
    }

    async set(key: string, otp: string, ttlInSeconds: number): Promise<void> {
        await this.client.set(key, otp, 'EX', ttlInSeconds);
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async delete(key: string): Promise<number> {
        return this.client.del(key);
    }
}
