import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@types';
import { AuthService } from '@features/auth/services/authService';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    login: (username: string, password: string) => Promise<void>;
    register: (
        username: string,
        email: string,
        password: string,
    ) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const getAuthErrorMessage = (error: unknown): string | null => {
    if (typeof error !== 'object' || error === null) {
        return null;
    }

    const response = (error as { response?: { data?: { error?: unknown } } })
        .response;
    const message = response?.data?.error;

    return typeof message === 'string' ? message : null;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: true,
            error: null,
            setUser: (user: User | null) => set({ user }),

            login: async (username: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { user, token } = await AuthService.login({
                        username,
                        password,
                    });
                    localStorage.setItem('token', token);
                    set({ user, isLoading: false });
                } catch (error: unknown) {
                    set({
                        error: getAuthErrorMessage(error),
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
                    await AuthService.register({
                        username,
                        email,
                        password,
                    });
                    const { user, token } = await AuthService.login({
                        username,
                        password,
                    });
                    localStorage.setItem('token', token);
                    set({ user, isLoading: false });
                } catch (error: unknown) {
                    set({
                        error: getAuthErrorMessage(error),
                        isLoading: false,
                    });
                    throw error;
                }
            },

            logout: async () => {
                // Always clear local auth state, even if request fails.
                localStorage.removeItem('token');
                set({ user: null, isLoading: false, error: null });

                try {
                    await AuthService.logout();
                } catch {
                    return;
                }
            },

            checkAuth: async () => {
                const token = localStorage.getItem('token');

                if (!token) {
                    set({ user: null, isLoading: false });
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
