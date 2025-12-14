import { create } from 'zustand';
import { User } from '../types';
import { CURRENT_USER } from '../mock';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,

    login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
            set({
                user: { ...CURRENT_USER, username },
                isLoading: false,
            });
            localStorage.setItem('token', 'mock_token');
            console.log(password);
        } catch (error) {
            console.error(error);
            set({ isLoading: false });
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
            set({ user: CURRENT_USER, isLoading: false });
        } else {
            set({ isLoading: false });
        }
    },
}));
