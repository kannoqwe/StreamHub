import { Module } from '@nestjs/common';
import { NatsConnectionProvider } from './nats.connection';
import { NatsProvisioningService } from '@modules/chat/nats/nats.provisioning';

@Module({
    providers: [NatsConnectionProvider, NatsProvisioningService],
    exports: [NatsConnectionProvider],
})
export class NatsModule {}
