export interface UserModel {
    id: number;
    username: string;
    displayName: string;
    avatar: string;
    bio?: string;
    followers: number;
    isOnline: boolean;
}