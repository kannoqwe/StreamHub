import { UserProfile } from "./user.model";

export interface Stream {
    id: number;
    title: string;
    thumbnail: string;
    viewerCount: number;
    category: string;
    tags: string[];
    startedAt: string;
    streamer: UserProfile;
}