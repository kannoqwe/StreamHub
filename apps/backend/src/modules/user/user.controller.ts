import { Controller, Get, Param } from '@nestjs/common';
import { ChannelData } from '@streamhub/shared';
import { UserService } from '@modules/user/user.service';

@Controller('User')
export class UserController {
    constructor(private userService: UserService) {}

    @Get(':username')
    async getChannelData(
        @Param('username') username: string,
    ): Promise<ChannelData> {
        return this.userService.findChannelData(username);
    }
}
