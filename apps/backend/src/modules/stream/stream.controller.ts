import {
    Controller,
    DefaultValuePipe,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { StreamService } from '@modules/stream/stream.service';
import { JwtGuard } from '@common/guards/jwt.guard';
import { Request } from 'express';
import {
    HomeFeedResponse,
    PublicCategoryResponse,
    PublicStreamCardResponse,
    RegenerateResponse,
} from '@modules/stream/interfaces/response.interface';
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

    @Get('home')
    @HttpCode(HttpStatus.OK)
    async getHomeFeed(
        @Query('limit', new DefaultValuePipe(24), ParseIntPipe) limit: number,
    ): Promise<HomeFeedResponse> {
        return this.streamService.getHomeFeed(limit);
    }

    @Get('live')
    @HttpCode(HttpStatus.OK)
    async getLiveStreams(
        @Query('limit', new DefaultValuePipe(24), ParseIntPipe) limit: number,
    ): Promise<PublicStreamCardResponse[]> {
        return this.streamService.getLiveStreams(limit);
    }

    @UseGuards(JwtGuard)
    @Get('live/following')
    @HttpCode(HttpStatus.OK)
    async getFollowedLiveStreams(
        @Req() req: Request,
        @Query('limit', new DefaultValuePipe(24), ParseIntPipe) limit: number,
    ): Promise<PublicStreamCardResponse[]> {
        return this.streamService.getFollowedLiveStreams(req.user.userId, limit);
    }

    @Get('categories')
    @HttpCode(HttpStatus.OK)
    async getCategories(): Promise<PublicCategoryResponse[]> {
        return this.streamService.getCategories();
    }

    @Get(':username')
    @HttpCode(HttpStatus.OK)
    async getChannelData(
        @Param('username') username: string,
    ): Promise<ChannelDto> {
        return this.streamService.getStreamPage(username);
    }
}
