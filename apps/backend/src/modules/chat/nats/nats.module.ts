import { Module } from '@nestjs/common';
import { NatsConnectionProvider } from './nats.connection';
import { NatsProvisioningService } from '@modules/chat/nats/nats.provisioning';
import { NatsBroadcastPublisher } from '@modules/chat/nats/nats.broadcast.publisher';
import { CHAT_BROADCAST_PUBLISHER } from '../types/broadcast.publisher';

@Module({
    providers: [
        NatsConnectionProvider,
        NatsProvisioningService,
        NatsBroadcastPublisher,
        {
            provide: CHAT_BROADCAST_PUBLISHER,
            useExisting: NatsBroadcastPublisher,
        },
    ],
    exports: [NatsConnectionProvider, CHAT_BROADCAST_PUBLISHER],
})
export class NatsModule {}
