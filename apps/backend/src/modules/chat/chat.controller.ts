import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RedisService } from '@modules/redis/redis.service';
import { ChatIngestEvent } from '@modules/chat/types/chat-ingest.event';
import { ChatKeys } from '@common/constants/redis.keys';

@Controller('chat')
export class ChatController {
    constructor(private readonly redis: RedisService) {}

    @Get('history/:streamerId')
    async history(
        @Param('streamerId', ParseIntPipe) streamerId: number,
    ): Promise<ChatIngestEvent[]> {
        const items = await this.redis.lrangeJson<ChatIngestEvent>(
            ChatKeys.last100(streamerId),
            0,
            99,
        );

        return items.reverse();
    }
}
