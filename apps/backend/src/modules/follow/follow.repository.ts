import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { PrismaClient } from '@generated/client';
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
}
