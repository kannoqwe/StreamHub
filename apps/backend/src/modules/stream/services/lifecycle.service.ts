import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { StreamSession } from '@generated/client';
import { StreamRepository } from '@modules/stream/stream.repository';
import { UserService } from '@modules/user/user.service';
import { ONE_HOUR_MS, validateCooldown } from '@common/utils/time';
import type { StreamKeyResponse } from '@streamhub/shared';
import { RedisService } from '@modules/redis/redis.service';
import { StreamKeys } from '@common/constants/redis.keys';
import { CategoryService } from '@modules/stream/services/category.service';

@Injectable()
export class StreamLifecycleService {
    constructor(
        private readonly streamRepository: StreamRepository,
        private readonly userService: UserService,
        private readonly redisService: RedisService,
        private readonly streamCategoryService: CategoryService,
    ) {}

    generateKey(): string {
        return `live_${randomBytes(16).toString('hex')}`;
    }

    async startStream(streamKey: string): Promise<StreamSession | null> {
        const user = await this.userService.findByStreamKey(streamKey);
        if (!user) throw new ForbiddenException('Invalid stream key');

        await this.streamRepository.end(user.id);

        const defaultCategoryId =
            await this.streamCategoryService.getDefaultCategoryId();
        const session = await this.streamRepository.start(user.id, {
            title: 'Untitled Stream',
            categoryId: defaultCategoryId,
        });

        await this.redisService.delete(StreamKeys.channelPage(user.username));

        return session;
    }

    async endStream(streamKey: string): Promise<void> {
        const user = await this.userService.findByStreamKey(streamKey);
        if (!user) throw new ForbiddenException('Invalid stream key');

        await this.streamRepository.end(user.id);
        await this.redisService.delete(StreamKeys.channelPage(user.username));
    }

    async regenerateStreamKey(userId: number): Promise<StreamKeyResponse> {
        const user = await this.userService.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        validateCooldown(user.streamKeyLastRegenerated, ONE_HOUR_MS);

        const newKey = this.generateKey();

        await this.userService.updateUser(userId, {
            streamKey: newKey,
            streamKeyLastRegenerated: new Date(),
        });

        return { streamKey: newKey };
    }

    async getCurrentStreamKey(userId: number): Promise<StreamKeyResponse> {
        const user = await this.userService.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        return { streamKey: user.streamKey };
    }
}
