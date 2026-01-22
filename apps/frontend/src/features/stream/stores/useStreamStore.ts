import { create } from 'zustand';
import { ChatMessage } from '@types';
import { StreamModel } from '@streamhub/shared';
import { StreamService } from '../services/streamService';
import { MOCK_CHAT } from '../../../mock';

interface StreamState {
    currentStream: StreamModel | null;
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;

    fetchStream: (username: string) => Promise<void>;
    addMessage: (message: ChatMessage) => void;
    reset: () => void;
}

export const useStreamStore = create<StreamState>((set) => ({
    currentStream: null,
    messages: [],
    isLoading: false,
    error: null,

    fetchStream: async (username: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = await StreamService.getByUsername(username);
            set({
                currentStream: data,
                messages: MOCK_CHAT,
                isLoading: false,
            });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || 'Stream not found',
                isLoading: false,
                currentStream: null,
            });
        }
    },

    addMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, message],
        })),

    reset: () =>
        set({
            currentStream: null,
            messages: [],
            error: null,
            isLoading: false,
        }),
}));
