import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FollowService } from '@modules/follow/follow.service';
import { FollowRepository } from '@modules/follow/follow.repository';
import { PrismaService } from '@modules/prisma/prisma.service';

describe('FollowService', () => {
    let service: FollowService;

    type FollowRecord = {
        createdAt: Date;
    };

    type TransactionClient = Record<string, unknown>;

    const tx: TransactionClient = {};
    const prisma = {
        $transaction: jest.fn<
            Promise<unknown>,
            [(client: TransactionClient) => Promise<unknown>]
        >((callback) => callback(tx)),
    };

    const repository = {
        findFollow: jest.fn<Promise<FollowRecord | null>, [number, number]>(),
        createFollow: jest.fn<
            Promise<FollowRecord>,
            [TransactionClient, number, number]
        >(),
        deleteFollow: jest.fn<
            Promise<void>,
            [TransactionClient, number, number]
        >(),
        incrementUserFollowers: jest.fn<
            Promise<void>,
            [TransactionClient, number]
        >(),
        incrementUserFollowing: jest.fn<
            Promise<void>,
            [TransactionClient, number]
        >(),
        decrementUserFollowers: jest.fn<
            Promise<void>,
            [TransactionClient, number]
        >(),
        decrementUserFollowing: jest.fn<
            Promise<void>,
            [TransactionClient, number]
        >(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        prisma.$transaction.mockImplementation((callback) => callback(tx));
        repository.findFollow.mockResolvedValue(null);
        repository.createFollow.mockResolvedValue({
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
        });
        repository.deleteFollow.mockResolvedValue(undefined);
        repository.incrementUserFollowers.mockResolvedValue(undefined);
        repository.incrementUserFollowing.mockResolvedValue(undefined);
        repository.decrementUserFollowers.mockResolvedValue(undefined);
        repository.decrementUserFollowing.mockResolvedValue(undefined);

        const moduleRef = await Test.createTestingModule({
            providers: [
                FollowService,
                { provide: PrismaService, useValue: prisma },
                { provide: FollowRepository, useValue: repository },
            ],
        }).compile();

        service = moduleRef.get(FollowService);
    });

    it('rejects following yourself', async () => {
        await expect(service.follow(1, 1)).rejects.toBeInstanceOf(
            BadRequestException,
        );
        expect(repository.findFollow).not.toHaveBeenCalled();
    });

    it('does not create duplicate follows', async () => {
        repository.findFollow.mockResolvedValue({
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
        });

        await expect(service.follow(1, 2)).resolves.toEqual({
            following: true,
            followedAt: '2026-01-01T00:00:00.000Z',
        });
        expect(prisma.$transaction).not.toHaveBeenCalled();
        expect(repository.createFollow).not.toHaveBeenCalled();
    });

    it('creates a follow and increments counters in one transaction', async () => {
        await expect(service.follow(1, 2)).resolves.toEqual({
            following: true,
            followedAt: '2026-01-01T00:00:00.000Z',
        });

        expect(repository.createFollow).toHaveBeenCalledWith(tx, 1, 2);
        expect(repository.incrementUserFollowers).toHaveBeenCalledWith(tx, 2);
        expect(repository.incrementUserFollowing).toHaveBeenCalledWith(tx, 1);
    });

    it('returns false without counter changes when unfollow target is missing', async () => {
        repository.findFollow.mockResolvedValue(null);

        await expect(service.unfollow(1, 2)).resolves.toEqual({
            following: false,
            followedAt: null,
        });
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('deletes a follow and decrements counters in one transaction', async () => {
        repository.findFollow.mockResolvedValue({
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
        });

        await expect(service.unfollow(1, 2)).resolves.toEqual({
            following: false,
            followedAt: null,
        });
        expect(repository.deleteFollow).toHaveBeenCalledWith(tx, 1, 2);
        expect(repository.decrementUserFollowers).toHaveBeenCalledWith(tx, 2);
        expect(repository.decrementUserFollowing).toHaveBeenCalledWith(tx, 1);
    });
});
