import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
    DependencyStatus,
    HealthResponse,
    ReadinessResponse,
} from './types/health.types';

@Injectable()
export class HealthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) {}

    health(): HealthResponse {
        return this.baseResponse();
    }

    async ready(): Promise<ReadinessResponse> {
        const [postgres, redis] = await Promise.all([
            this.checkPostgres(),
            this.checkRedis(),
        ]);

        return {
            ...this.baseResponse(),
            status: postgres === 'ok' && redis === 'ok' ? 'ok' : 'error',
            dependencies: {
                postgres,
                redis,
            },
        };
    }

    private baseResponse(): HealthResponse {
        return {
            status: 'ok',
            service: 'api',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }

    private async checkPostgres(): Promise<DependencyStatus> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return 'ok';
        } catch {
            return 'error';
        }
    }

    private async checkRedis(): Promise<DependencyStatus> {
        try {
            return (await this.redis.ping()) === 'PONG' ? 'ok' : 'error';
        } catch {
            return 'error';
        }
    }
}
