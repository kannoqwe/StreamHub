import { UserProfile } from "./user.model";

export interface StreamModel {
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