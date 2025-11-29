import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from '@config/validation.schema';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import path from 'node:path';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            validationSchema,
            validationOptions: { abortEarly: false },
            envFilePath: path.join(__dirname, '../../../../.env'),
        }),
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 10 }]),
        PrismaModule,
        AuthModule,
        UsersModule,
    ],
    providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
