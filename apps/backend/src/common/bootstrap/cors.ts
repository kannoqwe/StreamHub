import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type CorsOriginCallback = (error: Error | null, allow?: boolean) => void;

export function configureCors(
    app: INestApplication,
    configService: ConfigService,
): void {
    const allowedOrigins = configService.get<string[]>(
        'frontend.allowedOrigins',
    ) ?? ['http://localhost:5173'];

    app.enableCors({
        origin: (origin: string | undefined, callback: CorsOriginCallback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error('CORS origin is not allowed'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    });
}
