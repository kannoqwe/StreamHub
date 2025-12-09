import { Injectable } from '@nestjs/common';
import { UserRepository } from '@modules/user/user.repository';
import { User } from '@generated/client';
import { UserCreateInput, UserUpdateInput } from '@generated/models/User';
import { RedisService } from '@modules/redis/redis.service';
import { UserKeys } from '@common/constants/redis.keys';

@Injectable()
export class UserService {
    constructor(
        private usersRepository: UserRepository,
        private redisService: RedisService,
    ) {}

    async findUser(index: string | number): Promise<User | null> {
        if (typeof index === 'string') {
            return this.findByUsername(index);
        } else {
            return this.findByUUID(index);
        }
    }

    async findByUsername(username: string): Promise<User | null> {
        const userId = await this.redisService.get<number>(
            UserKeys.usernameIndex(username),
        );
        if (userId) {
            const cached = await this.redisService.get<User>(
                UserKeys.data(userId),
            );
            if (cached) return cached;
        }

        const user = await this.usersRepository.findByUsername(username);
        if (!user) return null;

        await this.redisService.set<number>(
            UserKeys.usernameIndex(username),
            user.id,
            300,
        );
        return user;
    }

    async findByUUID(userId: number): Promise<User | null> {
        const cached = await this.redisService.get<User>(UserKeys.data(userId));
        if (cached) return cached;

        const user = await this.usersRepository.findByUUID(userId);
        if (!user) return null;

        await this.redisService.set<User>(UserKeys.data(userId), user);
        return user;
    }

    async updateUser(userId: number, data: UserUpdateInput): Promise<User> {
        await this.redisService.delete(UserKeys.data(userId));

        return await this.usersRepository.update(userId, data);
    }

    async createUser(data: UserCreateInput): Promise<User> {
        const user = await this.usersRepository.create(data);

        await this.redisService.set<User>(UserKeys.data(user.id), user);

        return user;
    }
}
