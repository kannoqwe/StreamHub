import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { FollowRepository } from '@modules/follow/follow.repository';

@Injectable()
export class FollowService {
    constructor(
        private prisma: PrismaService,
        private followRepository: FollowRepository,
    ) {}

    async follow(followerId: number, followingId: number) {
        return this.prisma.$transaction(async (tx) => {
            const follow = await this.followRepository.createFollow(
                tx,
                followerId,
                followingId,
            );
            await this.followRepository.incrementUserFollowers(tx, followingId);
            await this.followRepository.incrementUserFollowing(tx, followerId);
            return follow;
        });
    }
}
