import { UserProfile } from "./user.model";
import { Category } from "./category.model";

export interface Stream {
    id: number;
    title: string;
    thumbnail?: string | null;
    viewerCount: number;
    category: Category;
    tags?: string[];
    startedAt: number;
    streamer: UserProfile;
}