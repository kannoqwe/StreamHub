import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
import { HealthResponse, ReadinessResponse } from './types/health.types';
import { HealthService } from './health.service';

@SkipThrottle()
@Controller()
export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    @Get('health')
    health(): HealthResponse {
        return this.healthService.health();
    }

    @Get('ready')
    async ready(
        @Res({ passthrough: true }) response: Response,
    ): Promise<ReadinessResponse> {
        const result = await this.healthService.ready();

        if (result.status === 'error') {
            response.status(HttpStatus.SERVICE_UNAVAILABLE);
        }

        return result;
    }
}
