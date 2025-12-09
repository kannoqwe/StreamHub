import { Module } from '@nestjs/common';
import { RedisService } from '@modules/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: (config: ConfigService) => {
                return new Redis({
                    host: config.get<string>('redis.host'),
                    port: config.get<number>('redis.port'),
                });
            },
            inject: [ConfigService],
        },
        RedisService,
    ],
    exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
