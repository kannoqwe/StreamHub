export interface PublicStreamUserResponse {
    id: number;
    username: string;
    displayName: string;
    avatar: string;
    isOnline: boolean;
}

export interface PublicStreamCardResponse {
    id: number;
    title: string;
    thumbnail: string;
    viewerCount: number;
    category: string;
    tags: string[];
    startedAt: string;
    streamer: PublicStreamUserResponse;
}

export interface PublicCategoryResponse {
    id: number;
    name: string;
    image: string;
}

export interface HomeFeedResponse {
    featuredStream: PublicStreamCardResponse | null;
    streams: PublicStreamCardResponse[];
    categories: PublicCategoryResponse[];
}

export interface FollowStateResponse {
    following: boolean;
    followedAt: string | null;
}
