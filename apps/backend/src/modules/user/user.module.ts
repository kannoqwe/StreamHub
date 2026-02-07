import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from '@modules/user/user.repository';
import { RedisModule } from '@modules/redis/redis.module';
import { UserController } from '@modules/user/user.controller';
import { FollowModule } from '@modules/follow/follow.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [RedisModule, FollowModule, JwtModule],
    controllers: [UserController],
    providers: [UserService, UserRepository],
    exports: [UserService, UserRepository],
})
export class UserModule {}
