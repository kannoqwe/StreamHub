import { create } from 'zustand';
import { User } from '@types';
import { CURRENT_USER } from '../mock';
import { AuthService } from '@features/auth/services/authService';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (
        username: string,
        email: string,
        password: string,
    ) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    error: null,

    login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const { user, token } = await AuthService.login({
                username,
                password,
            });
            localStorage.setItem('token', token);
            set({ user, isLoading: false });
            console.log(user, token);
        } catch (error: any) {
            set({
                error: error.response?.data?.error,
                isLoading: false,
            });
            throw error;
        }
    },

    register: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const { user, token } = await AuthService.register({
                username,
                email,
                password,
            });
            localStorage.setItem('token', token);
            set({ user, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error,
                isLoading: false,
            });
            throw error;
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
