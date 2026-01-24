import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { StreamService } from '@modules/stream/stream.service';
import { IngestDto } from '@modules/stream/dto/stream.dto';

@Controller('ingest')
export class IngestController {
    constructor(private streamService: StreamService) {}

    @Post('on_publish')
    @HttpCode(HttpStatus.OK)
    async onPublish(@Body() body: IngestDto) {
        await this.streamService.startStream(body.stream);
        return { code: 0, message: 'Stream started' };
    }

    @Post('on_unpublish')
    @HttpCode(HttpStatus.OK)
    async onUnPublish(@Body() body: IngestDto) {
        await this.streamService.endStream(body.stream);
        return { code: 0, message: 'Stream ended' };
    }
}
