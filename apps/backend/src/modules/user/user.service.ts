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

    async findById(userId: number): Promise<User | null> {
        const cached = await this.redisService.get<User>(UserKeys.data(userId));
        if (cached) return cached;

        const user = await this.usersRepository.findById(userId);
        if (!user) return null;

        await this.cacheUser(user);
        return user;
    }

    async findByUsername(username: string): Promise<User | null> {
        const userId = await this.redisService.get<number>(
            UserKeys.usernameIndex(username),
        );
        if (userId) {
            const user = await this.findById(userId);
            if (user) return user;
        }

        const user = await this.usersRepository.findByUsername(username);
        if (!user) return null;

        await this.cacheUser(user);

        return user;
    }

    async findByStreamKey(streamKey: string): Promise<User | null> {
        const userId = await this.redisService.get<number>(
            UserKeys.streamKeyIndex(streamKey),
        );
        if (userId) {
            const user = await this.findById(userId);
            if (user) return user;
        }

        const user = await this.usersRepository.findByStreamKey(streamKey);
        if (!user) return null;

        await this.redisService.set<number>(
            UserKeys.streamKeyIndex(streamKey),
            user.id,
            300,
        );

        await this.cacheUser(user);

        return user;
    }

    async updateUser(userId: number, data: UserUpdateInput): Promise<User> {
        const oldUser = await this.findById(userId);
        const updatedUser = await this.usersRepository.update(userId, data);

        if (oldUser && data.username && oldUser.username !== data.username) {
            await this.redisService.delete(
                UserKeys.usernameIndex(oldUser.username),
            );
        }

        if (oldUser && data.streamKey && oldUser.streamKey !== data.streamKey) {
            await this.redisService.delete(
                UserKeys.streamKeyIndex(oldUser.streamKey),
            );
        }

        await this.cacheUser(updatedUser);

        return updatedUser;
    }

    async createUser(data: UserCreateInput): Promise<User> {
        const user = await this.usersRepository.create(data);
        await this.cacheUser(user);

        return user;
    }

    public generateDefaultBio() {
        return 'This user has not set a bio yet.';
    }

    public generateDefaultAvatarUrl() {
        return 'https://emojiisland.com/cdn/shop/products/Emoji_Icon_-_Clown_emoji_grande.png?v=1571606089';
    }

    private async cacheUser(user: User) {
        await Promise.all([
            this.redisService.set<User>(UserKeys.data(user.id), user),
            this.redisService.set<number>(
                UserKeys.usernameIndex(user.username),
                user.id,
                300,
            ),
        ]);
    }
}
