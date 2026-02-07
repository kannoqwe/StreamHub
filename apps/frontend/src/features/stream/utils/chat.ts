import { ChatMessage } from '@types';
import { ChatIngestEvent } from '../types/chat';

export const colorForName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
};

export const mapIngestToChatMessage = (ev: ChatIngestEvent): ChatMessage => ({
    id: ev.message_id,
    user: ev.username || `user_${ev.user_id}`,
    color: colorForName(ev.username || `user_${ev.user_id}`),
    text: ev.content,
    timestamp: ev.timestamp,
});
