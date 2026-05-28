import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { FollowRepository } from '@modules/follow/follow.repository';

@Injectable()
export class FollowService {
    constructor(
        private prisma: PrismaService,
        private followRepository: FollowRepository,
    ) {}

    async follow(followerId: number, followingId: number) {
        this.validateIds(followerId, followingId);

        const exists = await this.followRepository.findFollow(
            followerId,
            followingId,
        );
        if (exists) {
            return {
                following: true,
                followedAt: exists.createdAt.toISOString(),
            };
        }

        return this.prisma.$transaction(async (tx) => {
            const follow = await this.followRepository.createFollow(
                tx,
                followerId,
                followingId,
            );
            await this.followRepository.incrementUserFollowers(tx, followingId);
            await this.followRepository.incrementUserFollowing(tx, followerId);
            return {
                following: true,
                followedAt: follow.createdAt.toISOString(),
            };
        });
    }

    async unfollow(followerId: number, followingId: number) {
        this.validateIds(followerId, followingId);

        const exists = await this.followRepository.findFollow(
            followerId,
            followingId,
        );
        if (!exists) {
            return {
                following: false,
                followedAt: null,
            };
        }

        await this.prisma.$transaction(async (tx) => {
            await this.followRepository.deleteFollow(
                tx,
                followerId,
                followingId,
            );
            await this.followRepository.decrementUserFollowers(tx, followingId);
            await this.followRepository.decrementUserFollowing(tx, followerId);
        });

        return {
            following: false,
            followedAt: null,
        };
    }

    async status(followerId: number, followingId: number) {
        this.validateIds(followerId, followingId);

        const follow = await this.followRepository.findFollow(
            followerId,
            followingId,
        );

        return {
            following: !!follow,
            followedAt: follow ? follow.createdAt.toISOString() : null,
        };
    }

    private validateIds(followerId: number, followingId: number) {
        if (followerId === followingId) {
            throw new BadRequestException('Cannot follow yourself');
        }
    }
}
