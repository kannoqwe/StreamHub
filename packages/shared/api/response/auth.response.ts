import { UserModel } from "../../models";

export interface LoginResponse {
    token: string;
    user: UserModel;
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
    token: string;
}