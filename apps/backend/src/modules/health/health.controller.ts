import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '@modules/prisma/prisma.service';
import { RedisService } from '@modules/redis/redis.service';
import { Response } from 'express';

type HealthResponse = {
    status: DependencyStatus;
    service: 'api';
    timestamp: string;
    uptime: number;
};

type DependencyStatus = 'ok' | 'error';

type ReadinessResponse = HealthResponse & {
    dependencies: {
        postgres: DependencyStatus;
        redis: DependencyStatus;
    };
};

@SkipThrottle()
@Controller()
export class HealthController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) {}

    @Get('health')
    health(): HealthResponse {
        return this.baseResponse();
    }

    @Get('ready')
    async ready(
        @Res({ passthrough: true }) response: Response,
    ): Promise<ReadinessResponse> {
        const [postgres, redis] = await Promise.all([
            this.checkPostgres(),
            this.checkRedis(),
        ]);
        const status: DependencyStatus =
            postgres === 'ok' && redis === 'ok' ? 'ok' : 'error';
        if (status === 'error') {
            response.status(HttpStatus.SERVICE_UNAVAILABLE);
        }

        return {
            ...this.baseResponse(),
            status,
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
