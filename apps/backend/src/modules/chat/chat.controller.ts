import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RedisService } from '@modules/redis/redis.service';
import { ChatIngestEvent } from '@modules/chat/types/chat-ingest.event';
import { ChatKeys } from '@common/constants/redis.keys';
import { ChatHistoryRepository } from '@modules/chat/scylla/chat-history.repository';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly redis: RedisService,
        private readonly historyRepo: ChatHistoryRepository,
    ) {}

    @Get('history/:streamerId')
    async history(
        @Param('streamerId', ParseIntPipe) streamerId: number,
    ): Promise<ChatIngestEvent[]> {
        const now = Date.now();
        const minScore = now - ChatKeys.TTL * 1000;
        const items = await this.redis.zrevrangeByScoreJson<ChatIngestEvent>(
            ChatKeys.last100(streamerId),
            now,
            minScore,
            ChatKeys.MAX,
        );

        return items.reverse();
    }

    @Get('history/:streamerId/:userId')
    async userHistory(
        @Param('streamerId', ParseIntPipe) streamerId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Query('limit') limit?: string,
        @Query('before') before?: string,
    ): Promise<ChatIngestEvent[]> {
        const parsedLimit = limit ? parseInt(limit, 10) : 100;
        const safeLimit = Number.isNaN(parsedLimit) ? 100 : parsedLimit;

        const items = await this.historyRepo.fetchUserHistory(
            streamerId,
            userId,
            safeLimit,
            before,
        );

        return items.reverse();
    }
}
