import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from '@modules/user/user.repository';

@Module({
    providers: [UserService, UserRepository],
    exports: [UserService, UserRepository],
})
export class UserModule {}
