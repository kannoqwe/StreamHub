import { Injectable, Logger } from '@nestjs/common';
import { ChatIngestEvent } from '@modules/chat/chat-ingest.event';

@Injectable()
export class IngestUseCase {
    private readonly logger = new Logger(IngestUseCase.name);

    async handle(event: ChatIngestEvent): Promise<void> {
        if (!event.streamer_id || !event.user_id || !event.content?.trim())
            return;

        this.logger.log(
            `ingest message_id=${event.message_id} streamer_id=${event.streamer_id} user_id=${event.user_id} content_len=${event.content.length}`,
        );
    }
}
