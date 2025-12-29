import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@types';
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

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
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
                } catch (error: any) {
                    set({
                        error: error.response?.data?.error,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            register: async (
                username: string,
                email: string,
                password: string,
            ) => {
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
                set({ user: null, isLoading: false });
            },

            checkAuth: async () => {
                const token = localStorage.getItem('token');
                const existingUser = get().user;

                if (!token) {
                    set({ user: null, isLoading: false });
                    return;
                }

                if (existingUser) {
                    set({ isLoading: false });
                    return;
                }

                try {
                    const user = await AuthService.getMe();
                    set({ user, isLoading: false });
                } catch {
                    set({ user: null, isLoading: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user }), // Сохраняем только юзера
        },
    ),
);
