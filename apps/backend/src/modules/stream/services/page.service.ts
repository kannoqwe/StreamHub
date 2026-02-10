import { Injectable, NotFoundException } from '@nestjs/common';
import { StreamModel, ChannelDto } from '@streamhub/shared';
import { StreamRepository } from '@modules/stream/stream.repository';
import { UserService } from '@modules/user/user.service';
import { Mapper } from '@common/utils/Mapper';
import { RedisService } from '@modules/redis/redis.service';
import { StreamKeys } from '@common/constants/redis.keys';

@Injectable()
export class StreamPageService {
    constructor(
        private readonly streamRepository: StreamRepository,
        private readonly userService: UserService,
        private readonly redisService: RedisService,
    ) {}

    async getActiveStream(
        username: string,
        includePrivateKey = false,
    ): Promise<StreamModel | null> {
        const stream =
            await this.streamRepository.findStreamByUsername(username);
        if (!stream) return null;

        return Mapper.mapToStream(stream, stream.streamer, includePrivateKey);
    }

    async getStreamPage(
        username: string,
        requesterUserId?: number,
    ): Promise<ChannelDto> {
        const page = await this.redisService.getOrSet<ChannelDto>(
            StreamKeys.channelPage(username),
            async () => {
                const user = await this.userService.findByUsername(username);
                if (!user) throw new NotFoundException('User not found');

                const stream = await this.getActiveStream(username);

                return {
                    user: Mapper.mapToUserProfile(user),
                    stream,
                };
            },
            StreamKeys.TTL_PAGE,
        );

        if (!page) {
            throw new NotFoundException('User not found');
        }

        if (requesterUserId === page.user.id && page.stream) {
            return {
                ...page,
                stream: await this.getActiveStream(username, true),
            };
        }

        return page;
    }
}
