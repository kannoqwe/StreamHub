import { create } from 'zustand';
import { Stream } from '@types';
import { streamService } from '../services/streamService';

interface GlobalState {
    recommended: Stream[];
    followed: Stream[];
    isLoading: boolean;

    fetchRecommended: () => Promise<void>;
    fetchFollowed: () => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
    recommended: [],
    followed: [],
    isLoading: false,

    fetchRecommended: async () => {
        set({ isLoading: true });
        try {
            const data = await streamService.getRecommendedStreams();
            set({ recommended: data, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch recommended', error);
            set({ isLoading: false });
        }
    },

    fetchFollowed: async () => {
        set({ isLoading: true });
        try {
            const data = await streamService.getFollowedStreams();
            set({ followed: data, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch followed', error);
            set({ isLoading: false });
        }
    },
}));
