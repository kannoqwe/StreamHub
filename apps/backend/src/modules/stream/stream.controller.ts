import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { StreamService } from '@modules/stream/stream.service';
import { JwtGuard } from '@common/guards/jwt.guard';
import { Request } from 'express';
import { RegenerateResponse } from '@modules/stream/interfaces/response.interface';
import { ChannelDto } from '@streamhub/shared';

@Controller('stream')
export class StreamController {
    constructor(private streamService: StreamService) {}

    @UseGuards(JwtGuard)
    @Post('generate_key')
    @HttpCode(HttpStatus.OK)
    async generateKey(@Req() req: Request): Promise<RegenerateResponse> {
        return this.streamService.regenerateStreamKey(req.user.userId);
    }

    @Get(':username')
    @HttpCode(HttpStatus.OK)
    async getChannelData(
        @Param('username') username: string,
    ): Promise<ChannelDto> {
        return this.streamService.getStreamPage(username);
    }
}
