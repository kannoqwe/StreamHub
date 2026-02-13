import { Injectable } from '@nestjs/common';
import { StreamSession } from '@generated/client';
import { StreamModel, ChannelDto, StreamKeyResponse } from '@streamhub/shared';
import {
    HomeFeedResponse,
    PublicCategoryResponse,
    PublicStreamCardResponse,
} from '@modules/stream/types/response.interface';
import { StreamLifecycleService } from '@modules/stream/services/lifecycle.service';
import { StreamPageService } from '@modules/stream/services/page.service';
import { StreamFeedService } from '@modules/stream/services/feed.service';

@Injectable()
export class StreamService {
    constructor(
        private readonly streamLifecycleService: StreamLifecycleService,
        private readonly streamPageService: StreamPageService,
        private readonly streamFeedService: StreamFeedService,
    ) {}

    generateKey(): string {
        return this.streamLifecycleService.generateKey();
    }

    async startStream(streamKey: string): Promise<StreamSession | null> {
        return this.streamLifecycleService.startStream(streamKey);
    }

    async endStream(streamKey: string): Promise<void> {
        return this.streamLifecycleService.endStream(streamKey);
    }

    async getActiveStream(
        username: string,
        includePrivateKey = false,
    ): Promise<StreamModel | null> {
        return this.streamPageService.getActiveStream(
            username,
            includePrivateKey,
        );
    }

    async getStreamPage(
        username: string,
        requesterUserId?: number,
    ): Promise<ChannelDto> {
        return this.streamPageService.getStreamPage(
            username,
            requesterUserId,
        );
    }

    async regenerateStreamKey(userId: number): Promise<StreamKeyResponse> {
        return this.streamLifecycleService.regenerateStreamKey(userId);
    }

    async getCurrentStreamKey(userId: number): Promise<StreamKeyResponse> {
        return this.streamLifecycleService.getCurrentStreamKey(userId);
    }

    async getLiveStreams(limit: number): Promise<PublicStreamCardResponse[]> {
        return this.streamFeedService.getLiveStreams(limit);
    }

    async getFollowedLiveStreams(
        userId: number,
        limit: number,
    ): Promise<PublicStreamCardResponse[]> {
        return this.streamFeedService.getFollowedLiveStreams(userId, limit);
    }

    async getCategories(): Promise<PublicCategoryResponse[]> {
        return this.streamFeedService.getCategories();
    }

    async getHomeFeed(limit: number): Promise<HomeFeedResponse> {
        return this.streamFeedService.getHomeFeed(limit);
    }
}
