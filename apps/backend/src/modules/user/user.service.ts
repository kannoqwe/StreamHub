import { Injectable } from '@nestjs/common';
import { UserRepository } from '@modules/user/user.repository';
import { User } from '@generated/client';
import { UserCreateInput, UserUpdateInput } from '@generated/models/User';

@Injectable()
export class UserService {
    constructor(private usersRepository: UserRepository) {}

    async findUser(index: string | number): Promise<User | null> {
        if (typeof index === 'string') {
            return this.findByUsername(index);
        } else {
            return this.findByUUID(index);
        }
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.usersRepository.findByUsername(username);
    }

    async findByUUID(uuid: number): Promise<User | null> {
        return this.usersRepository.findByUUID(uuid);
    }

    async updateUser(userId: number, data: UserUpdateInput): Promise<User> {
        return this.usersRepository.update(userId, data);
    }

    async createUser(data: UserCreateInput): Promise<User> {
        return this.usersRepository.create(data);
    }
}
