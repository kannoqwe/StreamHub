import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from '@config/validation.schema';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import path from 'node:path';
import { StreamModule } from '@modules/stream/stream.module';
import { RedisModule } from '@modules/redis/redis.module';
import { FollowModule } from '@modules/follow/follow.module';
import { IngestModule } from '@modules/ingest/ingest.module';
import { ChatModule } from '@modules/chat/chat.module';
import { HealthModule } from '@modules/health/health.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            validationSchema,
            validationOptions: { abortEarly: false },
            envFilePath: path.join(__dirname, '../../../../.env'),
        }),
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
        PrismaModule,
        RedisModule,
        AuthModule,
        UserModule,
        StreamModule,
        IngestModule,
        ChatModule,
        FollowModule,
        HealthModule,
    ],
    providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
