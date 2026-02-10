import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '@modules/user/user.repository';
import { User } from '@generated/client';
import { UserCreateInput, UserUpdateInput } from '@generated/models/User';
import { RedisService } from '@modules/redis/redis.service';
import { StreamKeys, UserKeys } from '@common/constants/redis.keys';
import { UpdateProfileDto } from '@modules/user/dto/update-profile.dto';

@Injectable()
export class UserService {
    constructor(
        private usersRepository: UserRepository,
        private redisService: RedisService,
    ) {}

    async findById(userId: number): Promise<User | null> {
        return this.redisService.getOrSet(
            UserKeys.data(userId),
            () => this.usersRepository.findById(userId),
            UserKeys.TTL,
        );
    }

    async findByUsername(username: string): Promise<User | null> {
        const userId = await this.redisService.getOrSet<number>(
            UserKeys.usernameIndex(username),
            async () => {
                const user =
                    await this.usersRepository.findByUsername(username);
                return user ? user.id : null;
            },
            UserKeys.TTL,
        );

        if (!userId) return null;

        return this.findById(userId);
    }

    async findByStreamKey(streamKey: string): Promise<User | null> {
        const userId = await this.redisService.getOrSet<number>(
            UserKeys.streamKeyIndex(streamKey),
            async () => {
                const user =
                    await this.usersRepository.findByStreamKey(streamKey);
                return user ? user.id : null;
            },
            UserKeys.TTL,
        );

        if (!userId) return null;

        return this.findById(userId);
    }

    async updateUser(userId: number, data: UserUpdateInput): Promise<User> {
        const oldUser = await this.findById(userId);
        const updatedUser = await this.usersRepository.update(userId, data);

        const keysToDelete: string[] = [];
        keysToDelete.push(UserKeys.data(userId));

        if (oldUser) {
            keysToDelete.push(StreamKeys.channelPage(oldUser.username));

            const nextUsername =
                typeof data.username === 'string' ? data.username : null;
            if (nextUsername && nextUsername !== oldUser.username) {
                keysToDelete.push(UserKeys.usernameIndex(oldUser.username));
                keysToDelete.push(StreamKeys.channelPage(nextUsername));
            }

            if (data.streamKey && data.streamKey !== oldUser.streamKey) {
                keysToDelete.push(UserKeys.streamKeyIndex(oldUser.streamKey));
            }
        }

        await this.redisService.mdel(keysToDelete);

        return updatedUser;
    }

    async updateProfile(userId: number, dto: UpdateProfileDto): Promise<User> {
        const user = await this.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        const nextUsername = dto.username ?? user.username;

        if (
            dto.displayName !== undefined &&
            dto.displayName.toLowerCase() !== nextUsername
        ) {
            throw new BadRequestException(
                'Display name must be the same as username',
            );
        }

        if (dto.username !== undefined && dto.username !== user.username) {
            const existing = await this.findByUsername(dto.username);
            if (existing && existing.id !== user.id) {
                throw new ConflictException('Username already exists');
            }
        }

        const payload: UserUpdateInput = {};
        if (dto.username !== undefined) payload.username = dto.username;
        if (dto.displayName !== undefined)
            payload.displayName = dto.displayName;
        if (dto.bio !== undefined) payload.bio = dto.bio;

        if (Object.keys(payload).length === 0) return user;

        return this.updateUser(userId, payload);
    }

    async createUser(data: UserCreateInput): Promise<User> {
        return await this.usersRepository.create(data);
    }

    public generateDefaultBio() {
        return 'This user has not set a bio yet.';
    }

    public generateDefaultAvatarUrl() {
        return 'https://emojiisland.com/cdn/shop/products/Emoji_Icon_-_Clown_emoji_grande.png?v=1571606089';
    }
}
