import { Module } from '@nestjs/common';
import { UserModule } from '@modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { StreamModule } from '@modules/stream/stream.module';
import { RedisModule } from '@modules/redis/redis.module';

@Module({
    imports: [UserModule, JwtModule, StreamModule, RedisModule],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
