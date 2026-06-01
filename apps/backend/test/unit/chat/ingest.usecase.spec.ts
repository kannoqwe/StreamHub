import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IngestUseCase } from '@modules/chat/ingest/ingest.usecase';
import { CHAT_BROADCAST_PUBLISHER } from '@modules/chat/types/broadcast.publisher';
import { RedisService } from '@modules/redis/redis.service';
import { ChatHistoryRepository } from '@modules/chat/scylla/chat-history.repository';
import { ChatKeys } from '@common/constants/redis.keys';
import { ChatIngestEvent } from '@modules/chat/types/chat-ingest.event';

describe('IngestUseCase', () => {
    let useCase: IngestUseCase;
    let loggerErrorSpy: jest.SpiedFunction<typeof Logger.prototype.error>;

    const event: ChatIngestEvent = {
        message_id: 'msg-1',
        streamer_id: 10,
        user_id: 20,
        username: 'viewer',
        content: 'hello',
        timestamp: '2026-01-01T00:00:00.000Z',
    };

    type BroadcasterMock = {
        publish: jest.Mock<Promise<void>, [number, ChatIngestEvent]>;
    };

    const broadcaster: BroadcasterMock = {
        publish: jest.fn<Promise<void>, [number, ChatIngestEvent]>(),
    };

    const redis: jest.Mocked<
        Pick<RedisService, 'setIfNotExists' | 'zaddTrimJson'>
    > = {
        setIfNotExists: jest.fn(),
        zaddTrimJson: jest.fn(),
    };

    const history: jest.Mocked<Pick<ChatHistoryRepository, 'enqueue'>> = {
        enqueue: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        loggerErrorSpy = jest
            .spyOn(Logger.prototype, 'error')
            .mockImplementation(() => undefined);
        redis.setIfNotExists.mockResolvedValue(true);
        redis.zaddTrimJson.mockResolvedValue(undefined);
        history.enqueue.mockResolvedValue(undefined);
        broadcaster.publish.mockResolvedValue(undefined);

        const moduleRef = await Test.createTestingModule({
            providers: [
                IngestUseCase,
                { provide: CHAT_BROADCAST_PUBLISHER, useValue: broadcaster },
                { provide: RedisService, useValue: redis },
                { provide: ChatHistoryRepository, useValue: history },
            ],
        }).compile();

        useCase = moduleRef.get(IngestUseCase);
    });

    afterEach(() => {
        loggerErrorSpy.mockRestore();
    });

    it('ignores empty messages before touching dependencies', async () => {
        await useCase.handle({ ...event, content: '   ' });

        expect(redis.setIfNotExists).not.toHaveBeenCalled();
        expect(broadcaster.publish).not.toHaveBeenCalled();
    });

    it('drops duplicate messages using redis deduplication', async () => {
        redis.setIfNotExists.mockResolvedValue(false);

        await useCase.handle(event);

        expect(redis.setIfNotExists).toHaveBeenCalledWith(
            ChatKeys.dedup(event.streamer_id, event.message_id),
            '1',
            ChatKeys.TTL,
        );
        expect(redis.zaddTrimJson).not.toHaveBeenCalled();
        expect(history.enqueue).not.toHaveBeenCalled();
        expect(broadcaster.publish).not.toHaveBeenCalled();
    });

    it('stores, queues, and broadcasts new messages', async () => {
        await useCase.handle(event);

        expect(redis.zaddTrimJson).toHaveBeenCalledWith(
            ChatKeys.last100(event.streamer_id),
            Date.parse(event.timestamp),
            event,
            ChatKeys.MAX,
            expect.any(Number),
        );
        expect(history.enqueue).toHaveBeenCalledWith(event);
        expect(broadcaster.publish).toHaveBeenCalledWith(
            event.streamer_id,
            event,
        );
    });

    it('still broadcasts when history queue fails', async () => {
        history.enqueue.mockRejectedValue(new Error('scylla down'));

        await useCase.handle(event);

        expect(broadcaster.publish).toHaveBeenCalledWith(
            event.streamer_id,
            event,
        );
    });
});
