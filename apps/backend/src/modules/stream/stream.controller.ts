import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { StreamService } from '@modules/stream/stream.service';
import { RtmpEventDto } from '@modules/stream/dto/stream.dto';
import { JwtGuard } from '@common/guards/jwt.guard';
import { Request } from 'express';
import { RegenerateResponse } from '@modules/stream/interfaces/response.interface';

@Controller('stream')
export class StreamController {
    constructor(private streamService: StreamService) {}

    @HttpCode(HttpStatus.OK)
    @Post('start')
    async start(@Body() dto: RtmpEventDto) {
        await this.streamService.startStream(dto.name);
    }

    @HttpCode(HttpStatus.OK)
    @Post('end')
    async end(@Body() dto: RtmpEventDto) {
        await this.streamService.endStream(dto.name);
    }

    @UseGuards(JwtGuard)
    @HttpCode(HttpStatus.OK)
    @Post('generate_key')
    async generateKey(@Req() req: Request): Promise<RegenerateResponse> {
        return this.streamService.regenerateStreamKey(req.user.userId);
    }
}
