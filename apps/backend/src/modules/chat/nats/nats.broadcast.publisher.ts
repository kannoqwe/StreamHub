import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StringCodec } from 'nats';

import { NatsConnectionProvider } from './nats.connection';
import { ChatBroadcastPublisher } from '../types/broadcast.publisher';
import { ChatIngestEvent } from '../types/chat-ingest.event';

@Injectable()
export class NatsBroadcastPublisher implements ChatBroadcastPublisher {
    private readonly sc = StringCodec();
    private readonly prefix: string;

    constructor(
        private readonly nats: NatsConnectionProvider,
        private readonly cfg: ConfigService,
    ) {
        this.prefix = cfg.get<string>('nats.broadcastPrefix')!;
    }

    async publish(streamerId: number, event: ChatIngestEvent): Promise<void> {
        const nc = await this.nats.get();
        const subject = `${this.prefix}.${streamerId}`;

        nc.publish(subject, this.sc.encode(JSON.stringify(event)));
    }
}
