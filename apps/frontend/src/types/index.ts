import {
    PublicCategoryResponse,
    PublicStreamCardResponse,
    UserModel,
} from '@streamhub/shared';

export type User = UserModel;
export type Stream = PublicStreamCardResponse;
export type Category = PublicCategoryResponse;

export interface ChatMessage {
    id: string;
    user: string;
    color: string;
    text: string;
    timestamp: string;
}
