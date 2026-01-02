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
}
