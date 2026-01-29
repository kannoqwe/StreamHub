export const INGEST_TRANSPORT = Symbol('INGEST_TRANSPORT');

export interface IngestTransport {
    start(): Promise<void>;
    stop(): Promise<void>;
}
