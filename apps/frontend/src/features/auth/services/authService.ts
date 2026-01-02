import { $api } from '@api';
import {
    UserProfile,
    LoginDto,
    RegisterDto,
    LoginResponse,
} from '@streamhub/shared';

export const AuthService = {
    async login(data: LoginDto): Promise<LoginResponse> {
        const response = await $api.post<LoginResponse>('/auth/login', data, {
            withCredentials: true,
        });
        console.log(response);
        return response.data;
    },

    async register(data: RegisterDto): Promise<LoginResponse> {
        const response = await $api.post<LoginResponse>('/auth/register', data);
        return response.data;
    },

    async getMe(): Promise<UserProfile> {
        const response = await $api.get<UserProfile>('/auth/me', {
            withCredentials: true,
        });
        return response.data;
    },

    async logout() {
        const response = await $api.post<LoginResponse>('/auth/logout', {
            withCredentials: true,
        });
        return response.data;
    },
};
