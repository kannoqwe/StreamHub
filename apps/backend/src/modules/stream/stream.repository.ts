import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { StreamStatus } from '@generated/enums';

@Injectable()
export class StreamRepository {
    constructor(private prismaService: PrismaService) {}

    async start(userId: number) {
        return this.prismaService.stream.create({
            data: {
                userId,
                startedAt: new Date(),
                status: StreamStatus.LIVE,
            },
        });
    }

    async end(userId: number) {
        return this.prismaService.stream.updateMany({
            where: {
                userId,
                status: StreamStatus.LIVE,
            },
            data: {
                userId,
                status: StreamStatus.ENDED,
                endedAt: new Date(),
            },
        });
    }
}
