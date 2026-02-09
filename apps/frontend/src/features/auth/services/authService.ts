import { $api } from '@api';
import {
    UserModel,
    LoginDto,
    RegisterDto,
    LoginResponse,
    LogoutResponse,
    RegisterResponse,
} from '@streamhub/shared';

export const AuthService = {
    async login(data: LoginDto): Promise<LoginResponse> {
        const response = await $api.post<LoginResponse>('/auth/login', data, {
            withCredentials: true,
        });
        return response.data;
    },

    async register(data: RegisterDto): Promise<RegisterResponse> {
        const response = await $api.post<RegisterResponse>(
            '/auth/register',
            data,
        );
        return response.data;
    },

    async getMe(): Promise<UserModel> {
        const response = await $api.get<UserModel>('/auth/me', {
            withCredentials: true,
        });
        return response.data;
    },

    async logout(): Promise<LogoutResponse> {
        const response = await $api.post<LogoutResponse>(
            '/auth/logout',
            {},
            {
                withCredentials: true,
            },
        );
        return response.data;
    },
};
