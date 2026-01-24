import { Module } from '@nestjs/common';
import { IngestController } from '@modules/ingest/ingest.controller';
import { IngestService } from '@modules/ingest/ingest.service';

@Module({
    imports: [],
    controllers: [IngestController],
    providers: [IngestService],
    exports: [],
})
export class IngestModule {}
