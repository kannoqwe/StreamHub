import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { StreamRepository } from '@modules/stream/stream.repository';
import { StreamSession } from '@generated/client';
import { UserService } from '@modules/user/user.service';
import { ONE_HOUR_MS, validateCooldown } from '@common/utils/time';
import { StreamModel, ChannelDto } from '@streamhub/shared';
import { Mapper } from '@common/utils/Mapper';
import { RedisService } from '@modules/redis/redis.service';
import { StreamKeys } from '@common/constants/redis.keys';
import {
    HomeFeedResponse,
    PublicCategoryResponse,
    PublicStreamCardResponse,
} from '@modules/stream/interfaces/response.interface';
import {
    DEFAULT_STREAM_LIST_LIMIT,
    MAX_STREAM_LIST_LIMIT,
} from '@modules/stream/constants/stream.constants';
import { StreamCategoryService } from '@modules/stream/services/stream-category.service';

@Injectable()
export class StreamService {
    constructor(
        private streamRepository: StreamRepository,
        private userService: UserService,
        private redisService: RedisService,
        private streamCategoryService: StreamCategoryService,
    ) {}

    generateKey() {
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

    async endStream(streamKey: string) {
        const user = await this.userService.findByStreamKey(streamKey);
        if (!user) throw new ForbiddenException('Invalid stream key');

        await this.streamRepository.end(user.id);
        await this.redisService.delete(StreamKeys.channelPage(user.username));
    }

    async getActiveStream(username: string): Promise<StreamModel | null> {
        const stream =
            await this.streamRepository.findStreamByUsername(username);
        if (!stream) return null;

        return Mapper.mapToStream(stream, stream.streamer);
    }

    async getStreamPage(username: string): Promise<ChannelDto> {
        const page = await this.redisService.getOrSet<ChannelDto>(
            StreamKeys.channelPage(username),
            async () => {
                const user = await this.userService.findByUsername(username);
                if (!user) throw new NotFoundException('User not found');

                const stream = await this.getActiveStream(username);

                return {
                    user: Mapper.mapToUserProfile(user),
                    stream,
                };
            },
            StreamKeys.TTL_PAGE,
        );

        if (!page) {
            throw new NotFoundException('User not found');
        }

        return page;
    }

    async regenerateStreamKey(userId: number) {
        const user = await this.userService.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        validateCooldown(user.streamKeyLastRegenerated, ONE_HOUR_MS);

        const newKey = this.generateKey();

        await this.userService.updateUser(userId, {
            streamKey: newKey,
            streamKeyLastRegenerated: new Date(),
        });

        return {
            streamKey: newKey,
        };
    }

    async getLiveStreams(limit: number): Promise<PublicStreamCardResponse[]> {
        const safeLimit = this.normalizeLimit(limit, DEFAULT_STREAM_LIST_LIMIT);
        const streams = await this.streamRepository.findLiveStreams(safeLimit);
        return streams.map((stream) => this.toPublicStreamCard(stream));
    }

    async getFollowedLiveStreams(
        userId: number,
        limit: number,
    ): Promise<PublicStreamCardResponse[]> {
        const safeLimit = this.normalizeLimit(limit, DEFAULT_STREAM_LIST_LIMIT);
        const streams = await this.streamRepository.findFollowedLiveStreams(
            userId,
            safeLimit,
        );
        return streams.map((stream) => this.toPublicStreamCard(stream));
    }

    async getCategories(): Promise<PublicCategoryResponse[]> {
        return this.streamCategoryService.getPublicCategories();
    }

    async getHomeFeed(limit: number): Promise<HomeFeedResponse> {
        const streams = await this.getLiveStreams(limit);
        const categories = await this.getCategories();

        return {
            featuredStream: streams[0] ?? null,
            streams,
            categories,
        };
    }

    private normalizeLimit(limit: number, fallback: number): number {
        if (!Number.isFinite(limit)) return fallback;
        return Math.min(Math.max(limit, 1), MAX_STREAM_LIST_LIMIT);
    }

    private toPublicStreamCard(stream: any): PublicStreamCardResponse {
        return {
            id: stream.id,
            title: stream.title,
            thumbnail: stream.thumbnail ?? stream.streamer.avatarUrl,
            viewerCount: 0,
            category: stream.category?.name ?? 'Unknown',
            tags: [],
            startedAt: stream.startedAt.toISOString(),
            streamer: {
                id: stream.streamer.id,
                username: stream.streamer.username,
                displayName: stream.streamer.displayName,
                avatar: stream.streamer.avatarUrl,
                isOnline: true,
            },
        };
    }

}
