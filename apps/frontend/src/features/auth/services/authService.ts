import { $api } from '@api';
import {
    UserModel,
    LoginDto,
    RegisterDto,
    LoginResponse,
} from '@streamhub/shared';

export const AuthService = {
    async login(data: LoginDto): Promise<LoginResponse> {
        const response = await $api.post<LoginResponse>('/auth/login', data, {
            withCredentials: true,
        });
        return response.data;
    },

    async register(data: RegisterDto): Promise<LoginResponse> {
        const response = await $api.post<LoginResponse>('/auth/register', data);
        return response.data;
    },

    async getMe(): Promise<UserModel> {
        const response = await $api.get<UserModel>('/auth/me', {
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
