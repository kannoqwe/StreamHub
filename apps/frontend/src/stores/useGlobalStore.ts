import { create } from 'zustand';
import { Stream } from '@types';
import { StreamService } from '@features/stream/services/streamService';

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
            const data = await StreamService.getRecommendedStreams();
            set({
                recommended: Array.isArray(data) ? data : [],
                isLoading: false,
            });
        } catch {
            set({ recommended: [], isLoading: false });
        }
    },

    fetchFollowed: async () => {
        set({ isLoading: true });
        try {
            const data = await StreamService.getFollowedStreams();
            set({
                followed: Array.isArray(data) ? data : [],
                isLoading: false,
            });
        } catch {
            set({ followed: [], isLoading: false });
        }
    },
}));
