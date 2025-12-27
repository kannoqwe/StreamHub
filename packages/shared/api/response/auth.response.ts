import { UserProfile } from "../models";

export interface LoginResponse {
    token: string;
    user: UserProfile;
}