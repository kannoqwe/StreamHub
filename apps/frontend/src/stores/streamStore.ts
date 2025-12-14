import { create } from 'zustand';
import { Stream } from '@types';
import { streamService } from '../services/streamService';

interface StreamState {
    recommended: Stream[];
    followed: Stream[];

    isRecommendedLoading: boolean;
    isFollowedLoading: boolean;

    fetchRecommended: () => Promise<void>;
    fetchFollowed: () => Promise<void>;
}

export const useStreamStore = create<StreamState>((set) => ({
    recommended: [],
    followed: [],
    isRecommendedLoading: false,
    isFollowedLoading: false,

    fetchRecommended: async () => {
        set({ isRecommendedLoading: true });
        try {
            const data = await streamService.getRecommendedStreams();
            set({ recommended: data, isRecommendedLoading: false });
        } catch (error) {
            console.error('Failed to fetch recommended', error);
            set({ isRecommendedLoading: false });
        }
    },

    fetchFollowed: async () => {
        set({ isFollowedLoading: true });
        try {
            const data = await streamService.getFollowedStreams();
            set({ followed: data, isFollowedLoading: false });
        } catch (error) {
            console.error('Failed to fetch followed', error);
            set({ isFollowedLoading: false });
        }
    },
}));
