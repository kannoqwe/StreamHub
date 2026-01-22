import {
    Body,
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
import { SrsHookDto } from '@modules/stream/dto/stream.dto';
import { JwtGuard } from '@common/guards/jwt.guard';
import { Request } from 'express';
import {
    RegenerateResponse,
    SrsHookResponse,
} from '@modules/stream/interfaces/response.interface';
import { StreamModel } from '@streamhub/shared';

@Controller('stream')
export class StreamController {
    constructor(private streamService: StreamService) {}

    @Post('start')
    async start(@Body() dto: SrsHookDto): Promise<SrsHookResponse> {
        await this.streamService.startStream(dto.stream);
        return { code: 0, message: 'Stream started' };
    }

    @Post('end')
    async end(@Body() dto: SrsHookDto): Promise<SrsHookResponse> {
        await this.streamService.endStream(dto.stream);
        return { code: 0, message: 'Stream ended' };
    }

    @Get('user/:username')
    async getStream(@Param('username') username: string): Promise<StreamModel> {
        return this.streamService.getActiveStream(username);
    }

    @UseGuards(JwtGuard)
    @HttpCode(HttpStatus.OK)
    @Post('generate_key')
    async generateKey(@Req() req: Request): Promise<RegenerateResponse> {
        return this.streamService.regenerateStreamKey(req.user.userId);
    }
}
