import { Module } from '@nestjs/common';
import { NatsConnectionProvider } from './nats.connection';

@Module({
    providers: [NatsConnectionProvider],
    exports: [NatsConnectionProvider],
})
export class NatsModule {}
