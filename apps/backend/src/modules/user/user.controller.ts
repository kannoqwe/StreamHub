import { Controller, Get, Param } from '@nestjs/common';
import { ChannelData } from '@streamhub/shared';
import { UserService } from '@modules/user/user.service';
import { ChannelService } from '@modules/user/channel.service';

@Controller('User')
export class UserController {
    constructor(
        private userService: UserService,
        private channelService: ChannelService,
    ) {}

    @Get(':username')
    async getChannelData(
        @Param('username') username: string,
    ): Promise<ChannelData> {
        return this.channelService.findChannelData(username);
    }
}
