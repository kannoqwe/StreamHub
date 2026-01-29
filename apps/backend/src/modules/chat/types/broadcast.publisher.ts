import { ChatIngestEvent } from './chat-ingest.event';

export const CHAT_BROADCAST_PUBLISHER = Symbol('CHAT_BROADCAST_PUBLISHER');

export interface ChatBroadcastPublisher {
    publish(streamerId: number, event: ChatIngestEvent): Promise<void>;
}
