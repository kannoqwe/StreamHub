export interface User {
    id: number;
    username: string;
    avatar: string;
    bio?: string;
    followers: number;
    isOnline: boolean;
}

export interface Stream {
    id: number;
    title: string;
    thumbnail: string;
    viewerCount: number;
    category: string;
    tags: string[];
    startedAt: string;
    streamer: User;
}

export interface Category {
    id: number;
    name: string;
    image: string;
}

export interface ChatMessage {
    id: number;
    user: string;
    color: string;
    text: string;
    timestamp: number;
}
