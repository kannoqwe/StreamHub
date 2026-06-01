import { INestApplication, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { NextFunction, Request, Response, urlencoded } from 'express';
import { randomUUID } from 'node:crypto';
import cookieParser from 'cookie-parser';

type ExpressLike = {
    set: (setting: string, value: string | number | boolean) => void;
};

function isExpressLike(value: unknown): value is ExpressLike {
    if (typeof value !== 'object' || value === null || !('set' in value)) {
        return false;
    }

    return typeof (value as { set?: unknown }).set === 'function';
}

export function configureHttp(app: INestApplication): void {
    trustProxy(app);
    app.use(cookieParser());
    app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
    app.use(requestLogger());
    app.use(urlencoded({ extended: true }));
}

function trustProxy(app: INestApplication): void {
    const adapterInstance: unknown = app.getHttpAdapter().getInstance();
    if (isExpressLike(adapterInstance)) {
        adapterInstance.set('trust proxy', 1);
    }
}

function requestLogger() {
    const logger = new Logger('HTTP');

    return (req: Request, res: Response, next: NextFunction): void => {
        const startedAt = Date.now();
        const requestId = req.header('x-request-id') ?? randomUUID();

        res.setHeader('x-request-id', requestId);
        res.on('finish', () => {
            const durationMs = Date.now() - startedAt;
            const isHlsAsset = req.path.startsWith('/stream/hls/');

            if (!isHlsAsset || res.statusCode >= 400) {
                logger.log(
                    `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms request_id=${requestId}`,
                );
            }
        });

        next();
    };
}
