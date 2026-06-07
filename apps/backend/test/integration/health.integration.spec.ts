import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Server } from 'node:http';
import { HealthController } from '@modules/health/health.controller';
import { HealthService } from '@modules/health/health.service';
import { PrismaService } from '@modules/prisma/prisma.service';
import { RedisService } from '@modules/redis/redis.service';

describe('Health endpoints integration', () => {
    let app: INestApplication;
    let server: Server;

    type PrismaMock = {
        $queryRaw: jest.Mock<Promise<unknown>, [TemplateStringsArray]>;
    };

    const prisma: PrismaMock = {
        $queryRaw: jest.fn<Promise<unknown>, [TemplateStringsArray]>(),
    };
    const redis: jest.Mocked<Pick<RedisService, 'ping'>> = {
        ping: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        prisma.$queryRaw.mockResolvedValue([{ result: 1 }]);
        redis.ping.mockResolvedValue('PONG');

        const moduleRef = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                HealthService,
                { provide: PrismaService, useValue: prisma },
                { provide: RedisService, useValue: redis },
            ],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
        server = app.getHttpServer() as Server;
    });

    afterEach(async () => {
        if (app) {
            await app.close();
        }
    });

    it('returns liveness without dependency checks', async () => {
        await request(server)
            .get('/health')
            .expect(200)
            .expect(({ body }) => {
                expect(body).toMatchObject({
                    status: 'ok',
                    service: 'api',
                });
            });

        expect(prisma.$queryRaw).not.toHaveBeenCalled();
        expect(redis.ping).not.toHaveBeenCalled();
    });

    it('returns readiness dependency status', async () => {
        await request(server)
            .get('/ready')
            .expect(200)
            .expect(({ body }) => {
                expect(body).toMatchObject({
                    status: 'ok',
                    service: 'api',
                    dependencies: {
                        postgres: 'ok',
                        redis: 'ok',
                    },
                });
            });
    });

    it('returns 503 when a readiness dependency fails', async () => {
        redis.ping.mockRejectedValue(new Error('redis unavailable'));

        await request(server)
            .get('/ready')
            .expect(503)
            .expect(({ body }) => {
                expect(body).toMatchObject({
                    status: 'error',
                    dependencies: {
                        postgres: 'ok',
                        redis: 'error',
                    },
                });
            });
    });
});
