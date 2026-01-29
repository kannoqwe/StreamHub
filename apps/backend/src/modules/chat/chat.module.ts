import { Module } from '@nestjs/common';
import { NatsModule } from '@modules/chat/nats/nats.module';
import { IngestUseCase } from '@modules/chat/ingest/ingest.usecase';
import { IngestSubscriberService } from '@modules/chat/ingest/ingest.subscriber';
import { RedisModule } from '@modules/redis/redis.module';
import { ChatController } from '@modules/chat/chat.controller';

@Module({
    imports: [NatsModule, RedisModule],
    controllers: [ChatController],
    providers: [IngestUseCase, IngestSubscriberService],
})
export class ChatModule {}
