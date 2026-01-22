import { Injectable, NotFoundException } from '@nestjs/common';
import { Mapper } from '@common/utils/Mapper';
import { UserService } from '@modules/user/user.service';
import { StreamService } from '@modules/stream/stream.service';
import { ChannelData } from '@streamhub/shared';

@Injectable()
export class ChannelService {
    constructor(
        private userService: UserService,
        private streamService: StreamService,
    ) {}

    async findChannelData(username: string): Promise<ChannelData> {
        const user = await this.userService.findByUsername(username);
        if (!user) throw new NotFoundException('User not found');

        const userModel = Mapper.mapToUserProfile(user);
        const streamModel = await this.streamService.getActiveStream(username);

        return { user: userModel, stream: streamModel };
    }
}
