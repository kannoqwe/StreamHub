import { Module } from '@nestjs/common';
import { IngestController } from '@modules/ingest/ingest.controller';
import { StreamModule } from '@modules/stream/stream.module';

@Module({
    imports: [StreamModule],
    controllers: [IngestController],
})
export class IngestModule {}
