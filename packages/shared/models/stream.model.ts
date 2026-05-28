export interface StreamModel {
    id: number;
    title: string;
    streamerId: number;
    thumbnail?: string | null;
    playbackId: string;
    viewerCount: number;
    category: number;
    tags?: string[];
    startedAt: number;
}
