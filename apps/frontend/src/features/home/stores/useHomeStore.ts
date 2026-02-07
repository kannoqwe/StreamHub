import { create } from 'zustand';
import { Stream, Category } from '@types';
import { streamService } from '../../../services/streamService';

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
        try {
            const data = await streamService.getHomeFeed();
            set({
                featuredStream: data.featuredStream,
                streams: data.streams,
                categories: data.categories,
                isLoading: false,
            });
        } catch (error) {
            console.error('Failed to fetch home feed', error);
            set({
                featuredStream: null,
                streams: [],
                categories: [],
                isLoading: false,
            });
        }
    },
}));
