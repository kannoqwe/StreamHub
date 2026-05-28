import {
    Body,
    Controller,
    ForbiddenException,
    Headers,
    HttpCode,
    HttpStatus,
    Post,
    Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StreamService } from '@modules/stream/stream.service';
import { IngestDto } from '@modules/stream/dto/stream.dto';

@Controller('ingest')
export class IngestController {
    constructor(
        private streamService: StreamService,
        private configService: ConfigService,
    ) {}

    @Post('on_publish')
    @HttpCode(HttpStatus.OK)
    async onPublish(
        @Body() body: IngestDto,
        @Headers('x-ingest-secret') headerSecret?: string,
        @Query('secret') querySecret?: string,
    ) {
        this.assertHookSecret(headerSecret, querySecret);
        await this.streamService.startStream(body.stream);
        return { code: 0, message: 'Stream started' };
    }

    @Post('on_unpublish')
    @HttpCode(HttpStatus.OK)
    async onUnPublish(
        @Body() body: IngestDto,
        @Headers('x-ingest-secret') headerSecret?: string,
        @Query('secret') querySecret?: string,
    ) {
        this.assertHookSecret(headerSecret, querySecret);
        await this.streamService.endStream(body.stream);
        return { code: 0, message: 'Stream ended' };
    }

    private assertHookSecret(headerSecret?: string, querySecret?: string) {
        const expected = this.configService.get<string>('ingest.hookSecret');
        if (!expected) return;

        const provided = headerSecret || querySecret;
        if (provided !== expected) {
            throw new ForbiddenException('Invalid ingest hook secret');
        }
    }
}
