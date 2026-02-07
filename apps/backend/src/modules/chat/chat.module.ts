import { Module } from '@nestjs/common';
import { NatsModule } from '@modules/chat/nats/nats.module';
import { IngestUseCase } from '@modules/chat/ingest/ingest.usecase';
import { IngestSubscriberService } from '@modules/chat/ingest/ingest.subscriber';
import { RedisModule } from '@modules/redis/redis.module';
import { ChatController } from '@modules/chat/chat.controller';
import { ScyllaModule } from '@modules/scylla/scylla.module';
import { ChatHistoryRepository } from '@modules/chat/scylla/chat-history.repository';

@Module({
    imports: [NatsModule, RedisModule, ScyllaModule],
    controllers: [ChatController],
    providers: [IngestUseCase, IngestSubscriberService, ChatHistoryRepository],
})
export class ChatModule {}
