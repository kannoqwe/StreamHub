import { $api } from '@api';
import { ChannelDto } from '@streamhub/shared';
import { ChatIngestEvent } from '../types/chat';

interface FollowStateResponse {
    following: boolean;
    followedAt: string | null;
}

export const StreamService = {
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
