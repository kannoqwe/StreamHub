import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Follow, PrismaClient } from '@generated/client';
import { ITXClientDenyList } from '@prisma/client/runtime/library';

@Injectable()
export class FollowRepository {
    constructor(private prisma: PrismaService) {}

    createFollow(
        tx: Omit<PrismaClient, ITXClientDenyList>,
        followerId: number,
        followingId: number,
    ) {
        return tx.follow.create({ data: { followerId, followingId } });
    }

    incrementUserFollowers(
        tx: Omit<PrismaClient, ITXClientDenyList>,
        userId: number,
    ) {
        return tx.user.update({
            where: { id: userId },
            data: { followersCount: { increment: 1 } },
        });
    }

    incrementUserFollowing(
        tx: Omit<PrismaClient, ITXClientDenyList>,
        userId: number,
    ) {
        return tx.user.update({
            where: { id: userId },
            data: { followingCount: { increment: 1 } },
        });
    }

    findFollow(
        followerId: number,
        followingId: number,
    ): Promise<Follow | null> {
        return this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
    }

    deleteFollow(
        tx: Omit<PrismaClient, ITXClientDenyList>,
        followerId: number,
        followingId: number,
    ) {
        return tx.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
    }

    decrementUserFollowers(
        tx: Omit<PrismaClient, ITXClientDenyList>,
        userId: number,
    ) {
        return tx.user.updateMany({
            where: { id: userId, followersCount: { gt: 0 } },
            data: { followersCount: { decrement: 1 } },
        });
    }

    decrementUserFollowing(
        tx: Omit<PrismaClient, ITXClientDenyList>,
        userId: number,
    ) {
        return tx.user.updateMany({
            where: { id: userId, followingCount: { gt: 0 } },
            data: { followingCount: { decrement: 1 } },
        });
    }
}
