import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from '@modules/user/user.repository';
import { RedisModule } from '@modules/redis/redis.module';
import { UserController } from '@modules/user/user.controller';
import { FollowModule } from '@modules/follow/follow.module';

@Module({
    imports: [RedisModule, FollowModule],
    controllers: [UserController],
    providers: [UserService, UserRepository],
    exports: [UserService, UserRepository],
})
export class UserModule {}
