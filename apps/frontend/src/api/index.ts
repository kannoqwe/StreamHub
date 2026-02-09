import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { RefreshResponse } from '@streamhub/shared';
import { useAuthStore } from '../stores/useAuthStore';

const shouldSkipRefresh = (requestUrl: unknown): boolean => {
    if (typeof requestUrl !== 'string') {
        return false;
    }

    return ['/auth/login', '/auth/register', '/auth/refresh'].some((path) =>
        requestUrl.includes(path),
    );
};

export const $api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

$api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

$api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const shouldRetryWithRefresh =
            error.response?.status === 401 &&
            !originalRequest?._isRetry &&
            !shouldSkipRefresh(originalRequest?.url);

        if (shouldRetryWithRefresh) {
            originalRequest._isRetry = true;
            try {
                const response: AxiosResponse<RefreshResponse> =
                    await axios.get(
                        `${import.meta.env.VITE_API_URL}/auth/refresh`,
                        {
                            withCredentials: true,
                        },
                    );

                const newToken = response.data.token;
                localStorage.setItem('token', newToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                return $api.request(originalRequest);
            } catch (reAuthError) {
                useAuthStore.getState().logout();
                return Promise.reject(reAuthError);
            }
        }
        return Promise.reject(error);
    },
);
