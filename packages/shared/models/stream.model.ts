export interface StreamModel {
    id: number;
    title: string;
    streamerId: number;
    thumbnail?: string | null;
    key?: string;
    viewerCount: number;
    category: number;
    tags?: string[];
    startedAt: number;
}