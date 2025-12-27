export interface UserProfile {
    id: number;
    username: string;
    displayName: string;
    avatar: string;
    bio?: string;
    followers: number;
    isOnline: boolean;
}