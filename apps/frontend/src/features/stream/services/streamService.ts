import { $api } from '@api';
import { ChatMessage } from '@types';
import { Stream } from '@streamhub/shared';

export const StreamService = {
    async getByUsername(username: string) {
        const { data } = await $api.get<Stream>(`/stream/user/${username}`);
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
