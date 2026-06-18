import { $api } from '@api';
import {
    ChannelDto,
    FollowStateResponse,
    HomeFeedResponse,
    PublicCategoryResponse,
    PublicStreamCardResponse,
} from '@streamhub/shared';
import { ChatIngestEvent } from '../types/chat';

export const StreamService = {
    async getRecommendedStreams(): Promise<PublicStreamCardResponse[]> {
        const { data } = await $api.get<PublicStreamCardResponse[]>(
            '/stream/live',
        );
        return Array.isArray(data) ? data : [];
    },

    async getFollowedStreams(): Promise<PublicStreamCardResponse[]> {
        const { data } = await $api.get<PublicStreamCardResponse[]>(
            '/stream/live/following',
        );
        return Array.isArray(data) ? data : [];
    },

    async getCategories(): Promise<PublicCategoryResponse[]> {
        const { data } = await $api.get<PublicCategoryResponse[]>(
            '/stream/categories',
        );
        return Array.isArray(data) ? data : [];
    },

    async getStreamsByCategory(
        categoryName: string,
    ): Promise<PublicStreamCardResponse[]> {
        const { data } = await $api.get<PublicStreamCardResponse[]>(
            `/stream/categories/${encodeURIComponent(categoryName)}/live`,
            { params: { limit: 48 } },
        );
        return Array.isArray(data) ? data : [];
    },

    async getHomeFeed(): Promise<HomeFeedResponse> {
        const { data } = await $api.get<HomeFeedResponse>('/stream/home');
        if (
            !data ||
            typeof data !== 'object' ||
            !Array.isArray(data.streams) ||
            !Array.isArray(data.categories)
        ) {
            return {
                featuredStream: null,
                streams: [],
                categories: [],
            };
        }

        return data;
    },

    async getChannelData(username: string) {
        const { data } = await $api.get<ChannelDto>(`/stream/${username}`);
        return data;
    },

    async getChatHistory(streamerId: number) {
        const { data } = await $api.get<ChatIngestEvent[]>(
            `/chat/history/${streamerId}`,
        );
        return data;
    },

    async follow(streamerId: number) {
        const { data } = await $api.post<FollowStateResponse>(
            `/user/follow/${streamerId}`,
        );
        return data;
    },

    async unfollow(streamerId: number) {
        const { data } = await $api.delete<FollowStateResponse>(
            `/user/follow/${streamerId}`,
        );
        return data;
    },

    async followStatus(streamerId: number) {
        const { data } = await $api.get<FollowStateResponse>(
            `/user/follow/${streamerId}`,
        );
        return data;
    },
};
