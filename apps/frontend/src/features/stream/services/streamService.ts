import { $api } from '@api';
import { ChatMessage } from '@types';
import { ChannelDto } from '@streamhub/shared';

export const StreamService = {
    async getChannelData(username: string) {
        const { data } = await $api.get<ChannelDto>(`/stream/${username}`);
        return data;
    },

    async sendMessage(streamId: number, text: string) {
        const { data } = await $api.post<ChatMessage>(
            `/stream/${streamId}/chat`,
            { text },
        );
        return data;
    },

    async follow(streamerId: number) {
        return $api.post(`/user/follow/${streamerId}`);
    },
};
