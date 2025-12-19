import { create } from 'zustand';
import { ChatMessage, Stream } from '@types';
import { MOCK_STREAMS, MOCK_CHAT } from '../../../mock';

interface StreamState {
    currentStream: Stream | null;
    messages: ChatMessage[];
    isLoading: boolean;

    fetchStreamByUsername: (username: string) => Promise<void>;
    addMessage: (message: ChatMessage) => void;
    clearStream: () => void;
}

export const useStreamStore = create<StreamState>((set) => ({
    currentStream: null,
    messages: [],
    isLoading: false,

    fetchStreamByUsername: async (username) => {
        set({ isLoading: true });
        const stream = MOCK_STREAMS.find(
            (s) =>
                s.streamer.displayName.toLowerCase() === username.toLowerCase(),
        );

        set({
            currentStream: stream || MOCK_STREAMS[0],
            messages: MOCK_CHAT,
            isLoading: false,
        });
    },

    addMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, message],
        })),

    clearStream: () => set({ currentStream: null, messages: [] }),
}));
