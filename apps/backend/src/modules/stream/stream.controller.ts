import {
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { StreamService } from '@modules/stream/stream.service';
import { JwtGuard } from '@common/guards/jwt.guard';
import { Request } from 'express';
import { RegenerateResponse } from '@modules/stream/interfaces/response.interface';

@Controller('stream')
export class StreamController {
    constructor(private streamService: StreamService) {}
    @UseGuards(JwtGuard)
    @HttpCode(HttpStatus.OK)
    @Post('generate_key')
    async generateKey(@Req() req: Request): Promise<RegenerateResponse> {
        return this.streamService.regenerateStreamKey(req.user.userId);
    }
}
