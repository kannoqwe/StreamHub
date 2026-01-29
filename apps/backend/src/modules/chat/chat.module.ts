import { Module } from '@nestjs/common';
import { NatsModule } from '@modules/chat/nats/nats.module';
import { IngestUseCase } from '@modules/chat/ingest/ingest.usecase';
import { IngestSubscriberService } from '@modules/chat/ingest/ingest.subscriber';

@Module({
    imports: [NatsModule],
    providers: [IngestUseCase, IngestSubscriberService],
})
export class ChatModule {}
