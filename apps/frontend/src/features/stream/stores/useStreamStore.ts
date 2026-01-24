import { create } from 'zustand';
import { ChatMessage } from '@types';
import { StreamModel, UserModel } from '@streamhub/shared';
import { StreamService } from '../services/streamService';
import { MOCK_CHAT } from '../../../mock';

interface StreamState {
    streamer: UserModel | null;
    currentStream: StreamModel | null;
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;

    fetchStream: (username: string) => Promise<void>;
    addMessage: (message: ChatMessage) => void;
    reset: () => void;
}

export const useStreamStore = create<StreamState>((set) => ({
    streamer: null,
    currentStream: null,
    messages: [],
    isLoading: false,
    error: null,

    fetchStream: async (username: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = await StreamService.getChannelData(username);
            set({
                streamer: data.user,
                currentStream: data.stream,
                messages: MOCK_CHAT,
                isLoading: false,
            });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || 'Stream not found',
                isLoading: false,
                streamer: null,
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
            streamer: null,
            currentStream: null,
            messages: [],
            error: null,
            isLoading: false,
        }),
}));
