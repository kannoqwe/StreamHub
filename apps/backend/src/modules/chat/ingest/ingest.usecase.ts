import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChatIngestEvent } from '@modules/chat/types/chat-ingest.event';
import {
    CHAT_BROADCAST_PUBLISHER,
    ChatBroadcastPublisher,
} from '@modules/chat/types/broadcast.publisher';

@Injectable()
export class IngestUseCase {
    private readonly logger = new Logger(IngestUseCase.name);

    constructor(
        @Inject(CHAT_BROADCAST_PUBLISHER)
        private readonly broadcaster: ChatBroadcastPublisher,
    ) {}

    async handle(event: ChatIngestEvent): Promise<void> {
        if (!event.streamer_id || !event.user_id || !event.content?.trim())
            return;

        this.logger.log(
            `ingest message_id=${event.message_id} streamer_id=${event.streamer_id} user_id=${event.user_id} content_len=${event.content.length}`,
        );

        const out: ChatIngestEvent = {
            message_id: event.message_id,
            streamer_id: event.streamer_id,
            user_id: event.user_id,
            username: event.username,
            content: event.content,
            timestamp: event.timestamp,
        };

        await this.broadcaster.publish(event.streamer_id, out);
    }
}
