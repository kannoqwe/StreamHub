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
        return data;
    },

    async getFollowedStreams(): Promise<PublicStreamCardResponse[]> {
        const { data } = await $api.get<PublicStreamCardResponse[]>(
            '/stream/live/following',
        );
        return data;
    },

    async getCategories(): Promise<PublicCategoryResponse[]> {
        const { data } = await $api.get<PublicCategoryResponse[]>(
            '/stream/categories',
        );
        return data;
    },

    async getHomeFeed(): Promise<HomeFeedResponse> {
        const { data } = await $api.get<HomeFeedResponse>('/stream/home');
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
