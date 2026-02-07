import { Stream } from '@types';
import { $api } from '@api';
import { Category } from '@types';

interface HomeFeedResponse {
    featuredStream: Stream | null;
    streams: Stream[];
    categories: Category[];
}

export const streamService = {
    getRecommendedStreams: async (): Promise<Stream[]> => {
        const { data } = await $api.get<Stream[]>('/stream/live');
        return data;
    },

    getFollowedStreams: async (): Promise<Stream[]> => {
        const { data } = await $api.get<Stream[]>('/stream/live/following');
        return data;
    },

    getCategories: async (): Promise<Category[]> => {
        const { data } = await $api.get<Category[]>('/stream/categories');
        return data;
    },

    getHomeFeed: async (): Promise<HomeFeedResponse> => {
        const { data } = await $api.get<HomeFeedResponse>('/stream/home');
        return data;
    },
};
