export interface JwtPayload {
    userId: number;
    username: string;
    jti?: string;
    iat?: number;
    exp?: number;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
}

export interface AuthResponse {
    accessToken: string;
    user?: {
        id: number;
        username: string;
        email: string;
    };
}
