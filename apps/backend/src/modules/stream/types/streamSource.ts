import { StreamRepository } from '@modules/stream/stream.repository';

export type PublicStreamSource = Awaited<
    ReturnType<StreamRepository['findLiveStreams']>
>[number];
