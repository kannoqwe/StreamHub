import { User } from '@generated/client';

export interface LoginResponse {
    accessToken: string;
}

export interface RegisterResponse {
    id: number;
    username: string;
    email: string;
}

export interface LogoutResponse {
    success: boolean;
    message: string;
}

export interface RefreshResponse {
    accessToken: string;
}
