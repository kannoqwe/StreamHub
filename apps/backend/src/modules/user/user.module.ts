import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from '@modules/user/user.repository';
import { RedisModule } from '@modules/redis/redis.module';
import { UserController } from '@modules/user/user.controller';
import { ChannelService } from '@modules/user/channel.service';

@Module({
    imports: [RedisModule],
    controllers: [UserController],
    providers: [UserService, UserRepository, ChannelService],
    exports: [UserService, UserRepository],
})
export class UserModule {}
