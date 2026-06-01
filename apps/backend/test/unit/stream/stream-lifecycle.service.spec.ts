import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { StreamLifecycleService } from '@modules/stream/services/lifecycle.service';
import { StreamRepository } from '@modules/stream/stream.repository';
import { UserService } from '@modules/user/user.service';
import { RedisService } from '@modules/redis/redis.service';
import { CategoryService } from '@modules/stream/services/category.service';
import { StreamKeys } from '@common/constants/redis.keys';

describe('StreamLifecycleService', () => {
    let service: StreamLifecycleService;

    type StreamUser = {
        id: number;
        username: string;
        streamKey: string;
        streamKeyLastRegenerated: Date | null;
    };

    type StreamSession = {
        id: number;
        streamerId: number;
        title: string;
        categoryId: number;
        isLive: boolean;
    };

    const streamUser: StreamUser = {
        id: 7,
        username: 'kanno',
        streamKey: 'live_secret',
        streamKeyLastRegenerated: null,
    };

    const session: StreamSession = {
        id: 11,
        streamerId: streamUser.id,
        title: 'Untitled Stream',
        categoryId: 3,
        isLive: true,
    };

    const repository = {
        end: jest.fn<Promise<void>, [number]>(),
        start: jest.fn<
            Promise<StreamSession>,
            [number, { title: string; categoryId: number }]
        >(),
    };

    const users = {
        findByStreamKey: jest.fn<Promise<StreamUser | null>, [string]>(),
        findById: jest.fn<Promise<StreamUser | null>, [number]>(),
        updateUser: jest.fn<Promise<void>, [number, Partial<StreamUser>]>(),
    };

    const redis = {
        delete: jest.fn<Promise<number>, [string]>(),
    };

    const categories = {
        getDefaultCategoryId: jest.fn<Promise<number>, []>(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        users.findByStreamKey.mockResolvedValue(streamUser);
        users.findById.mockResolvedValue(streamUser);
        repository.start.mockResolvedValue(session);
        repository.end.mockResolvedValue(undefined);
        redis.delete.mockResolvedValue(1);
        categories.getDefaultCategoryId.mockResolvedValue(3);

        const moduleRef = await Test.createTestingModule({
            providers: [
                StreamLifecycleService,
                { provide: StreamRepository, useValue: repository },
                { provide: UserService, useValue: users },
                { provide: RedisService, useValue: redis },
                { provide: CategoryService, useValue: categories },
            ],
        }).compile();

        service = moduleRef.get(StreamLifecycleService);
    });

    it('ends previous sessions before starting a new stream', async () => {
        const result = await service.startStream('live_secret');

        expect(repository.end).toHaveBeenCalledWith(streamUser.id);
        expect(repository.start).toHaveBeenCalledWith(streamUser.id, {
            title: 'Untitled Stream',
            categoryId: 3,
        });
        expect(redis.delete).toHaveBeenCalledWith(
            StreamKeys.channelPage(streamUser.username),
        );
        expect(result).toEqual(session);
    });

    it('rejects an invalid stream key on publish', async () => {
        users.findByStreamKey.mockResolvedValue(null);

        await expect(service.startStream('bad_key')).rejects.toBeInstanceOf(
            ForbiddenException,
        );
        expect(repository.start).not.toHaveBeenCalled();
    });

    it('ends the active session and clears channel cache on unpublish', async () => {
        await service.endStream('live_secret');

        expect(repository.end).toHaveBeenCalledWith(streamUser.id);
        expect(redis.delete).toHaveBeenCalledWith(
            StreamKeys.channelPage(streamUser.username),
        );
    });

    it('throws when the current stream key user is missing', async () => {
        users.findById.mockResolvedValue(null);

        await expect(service.getCurrentStreamKey(99)).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });
});
