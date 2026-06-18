import { Injectable } from '@nestjs/common';
import { StreamRepository } from '@modules/stream/stream.repository';
import {
    HomeFeedResponse,
    PublicCategoryResponse,
    PublicStreamCardResponse,
} from '@modules/stream/types/response.interface';
import {
    DEFAULT_STREAM_LIST_LIMIT,
    MAX_STREAM_LIST_LIMIT,
} from '@modules/stream/constants/stream.constants';
import { CategoryService } from '@modules/stream/services/category.service';
import { PublicStreamSource } from '@modules/stream/types/streamSource';

@Injectable()
export class StreamFeedService {
    constructor(
        private readonly streamRepository: StreamRepository,
        private readonly streamCategoryService: CategoryService,
    ) {}

    async getLiveStreams(limit: number): Promise<PublicStreamCardResponse[]> {
        const safeLimit = this.normalizeLimit(limit, DEFAULT_STREAM_LIST_LIMIT);
        const streams = await this.streamRepository.findLiveStreams(safeLimit);
        return streams.map((stream: PublicStreamSource) =>
            this.toPublicStreamCard(stream),
        );
    }

    async getLiveStreamsByCategory(
        categoryName: string,
        limit: number,
    ): Promise<PublicStreamCardResponse[]> {
        const safeLimit = this.normalizeLimit(limit, DEFAULT_STREAM_LIST_LIMIT);
        const streams =
            await this.streamRepository.findLiveStreamsByCategoryName(
                categoryName,
                safeLimit,
            );
        return streams.map((stream: PublicStreamSource) =>
            this.toPublicStreamCard(stream),
        );
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
        return streams.map((stream: PublicStreamSource) =>
            this.toPublicStreamCard(stream),
        );
    }

    async getCategories(): Promise<PublicCategoryResponse[]> {
        return this.streamCategoryService.getPublicCategories();
    }

    async getHomeFeed(limit: number): Promise<HomeFeedResponse> {
        const streams = await this.getLiveStreams(limit);
        const categories = await this.getCategories();

        return {
            featuredStream: null,
            streams,
            categories,
        };
    }

    private normalizeLimit(limit: number, fallback: number): number {
        if (!Number.isFinite(limit)) return fallback;
        return Math.min(Math.max(limit, 1), MAX_STREAM_LIST_LIMIT);
    }

    private toPublicStreamCard(
        stream: PublicStreamSource,
    ): PublicStreamCardResponse {
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
