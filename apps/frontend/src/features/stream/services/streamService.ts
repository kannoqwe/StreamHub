import { $api } from '@api';
import { ChannelDto } from '@streamhub/shared';
import { ChatIngestEvent } from '../types/chat';

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
        return $api.post(`/user/follow/${streamerId}`);
    },
};
