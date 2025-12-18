import { create } from 'zustand';
import { Stream, Category } from '@types';
import { MOCK_CATEGORIES, MOCK_STREAMS } from '../../../mock';

interface HomeState {
    featuredStream: Stream | null;
    streams: Stream[];
    categories: Category[];
    isLoading: boolean;
    fetchHomeData: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set) => ({
    featuredStream: null,
    streams: [],
    categories: [],
    isLoading: false,
    fetchHomeData: async () => {
        set({ isLoading: true });

        set({
            featuredStream: MOCK_STREAMS[0],
            streams: MOCK_STREAMS,
            categories: MOCK_CATEGORIES,
            isLoading: false,
        });
    },
}));
