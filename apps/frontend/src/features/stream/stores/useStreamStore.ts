import { create } from 'zustand';
import { ChatMessage } from '@types';
import { StreamModel, UserModel } from '@streamhub/shared';
import { StreamService } from '../services/streamService';

interface StreamState {
    streamer: UserModel | null;
    currentStream: StreamModel | null;
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;

    fetchStream: (username: string) => Promise<void>;
    setMessages: (messages: ChatMessage[]) => void;
    addMessage: (message: ChatMessage) => void;
    reset: () => void;
}

const MAX_CHAT_MESSAGES = 100;

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
                messages: [],
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

    setMessages: (messages) =>
        set({ messages: messages.slice(-MAX_CHAT_MESSAGES) }),

    addMessage: (message) =>
        set((state) => {
            if (state.messages.some((m) => m.id === message.id)) {
                return state;
            }
            const next = [...state.messages, message];
            return { messages: next.slice(-MAX_CHAT_MESSAGES) };
        }),

    reset: () =>
        set({
            streamer: null,
            currentStream: null,
            messages: [],
            error: null,
            isLoading: false,
        }),
}));
