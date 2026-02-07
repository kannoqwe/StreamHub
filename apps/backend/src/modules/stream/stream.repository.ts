import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { StartSreamDto } from '@modules/stream/dto/stream.dto';

@Injectable()
export class StreamRepository {
    constructor(private prismaService: PrismaService) {}

    async start(streamerId: number, dto: StartSreamDto) {
        return this.prismaService.streamSession.create({
            data: {
                streamerId,
                title: dto.title,
                categoryId: dto.categoryId,
                isLive: true,
            },
        });
    }

    async end(streamerId: number) {
        return this.prismaService.streamSession.updateMany({
            where: {
                streamerId,
                isLive: true,
            },
            data: {
                streamerId,
                isLive: false,
                endedAt: new Date(),
            },
        });
    }

    async findStreamByUsername(username: string) {
        return this.prismaService.streamSession.findFirst({
            where: {
                streamer: { username },
                isLive: true,
            },
            include: {
                streamer: true,
                category: true,
            },
        });
    }

    async findLiveStreams(limit: number) {
        return this.prismaService.streamSession.findMany({
            where: { isLive: true },
            orderBy: { startedAt: 'desc' },
            take: limit,
            include: {
                streamer: true,
                category: true,
            },
        });
    }

    async findFollowedLiveStreams(followerId: number, limit: number) {
        return this.prismaService.streamSession.findMany({
            where: {
                isLive: true,
                streamer: {
                    followers: {
                        some: {
                            followerId,
                        },
                    },
                },
            },
            orderBy: { startedAt: 'desc' },
            take: limit,
            include: {
                streamer: true,
                category: true,
            },
        });
    }

    async findCategories() {
        return this.prismaService.category.findMany({
            orderBy: { name: 'asc' },
        });
    }
}
