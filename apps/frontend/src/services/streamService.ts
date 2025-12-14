import { Stream } from '@types';
import { MOCK_STREAMS } from '../mock';

export const streamService = {
    getRecommendedStreams: async (): Promise<Stream[]> => {
        return MOCK_STREAMS;
    },

    getFollowedStreams: async (): Promise<Stream[]> => {
        return MOCK_STREAMS.slice(0, 2);
    },
};
