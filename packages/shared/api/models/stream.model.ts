import { UserProfile } from "./user.model";

export interface Stream {
    id: number;
    title: string;
    thumbnail?: string | null;
    key?: string;
    viewerCount: number;
    category: number;
    tags?: string[];
    startedAt: number;
    streamer: UserProfile;
}