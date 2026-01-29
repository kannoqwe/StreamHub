export interface ChatIngestEvent {
    message_id: string; // Snowflake
    streamer_id: number;
    user_id: number;
    username: string;
    content: string;
    timestamp: string; // ISO
}
