import axios, { InternalAxiosRequestConfig } from 'axios';

export const $api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/auth/refresh`,
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

        if (error.response?.status === 401 && !originalRequest._isRetry) {
            originalRequest._isRetry = true;
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/auth/refresh`,
                    {
                        withCredentials: true,
                    },
                );

                const newToken = response.data.accessToken;
                localStorage.setItem('token', newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return $api.request(originalRequest);
            } catch (reAuthError) {
                localStorage.removeItem('token');
                return Promise.reject(reAuthError);
            }
        }
        return Promise.reject(error);
    },
);
