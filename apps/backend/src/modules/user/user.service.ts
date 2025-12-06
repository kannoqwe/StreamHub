import { Injectable } from '@nestjs/common';
import { UserRepository } from '@modules/user/user.repository';
import { User } from '@generated/client';
import { UserCreateInput, UserUpdateInput } from '@generated/models/User';

@Injectable()
export class UserService {
    constructor(private usersRepository: UserRepository) {}

    async findUser(index: string | number): Promise<User | null> {
        if (typeof index === 'string') {
            return this.usersRepository.findByUsername(index);
        } else {
            return this.usersRepository.findByUUID(index);
        }
    }

    async updateUser(userId: number, data: UserUpdateInput): Promise<User> {
        return this.usersRepository.update(userId, data);
    }

    async createUser(data: UserCreateInput): Promise<User> {
        return this.usersRepository.create(data);
    }
}
