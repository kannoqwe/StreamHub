import { useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useStreamStore } from '../stores/useStreamStore';
import { useAuthStore } from '../../../stores/useAuthStore';
import { StreamService } from '../services/streamService';
import { mapIngestToChatMessage } from '../utils/chat';
import { ChatIngestEvent } from '../types/chat';

const buildWsUrl = (base: string, token: string) => {
    let url: URL;
    try {
        url = new URL(base);
    } catch {
        url = new URL('ws://localhost:8081/ws');
    }

    if (url.protocol === 'http:') url.protocol = 'ws:';
    if (url.protocol === 'https:') url.protocol = 'wss:';

    url.searchParams.set('token', token);
    return url.toString();
};

export const useStream = () => {
    const { username } = useParams<{ username: string }>();
    const { user } = useAuthStore();

    const wsRef = useRef<WebSocket | null>(null);

    const {
        streamer,
        currentStream,
        messages,
        isLoading,
        error,
        fetchStream,
        setMessages,
        addMessage,
        reset,
    } = useStreamStore();

    useEffect(() => {
        if (username) {
            void fetchStream(username);
        }
        return () => reset();
    }, [username, fetchStream, reset]);

    useEffect(() => {
        if (!streamer) return;

        const load = async () => {
            try {
                const history = await StreamService.getChatHistory(streamer.id);
                setMessages(history.map(mapIngestToChatMessage));
            } catch (e) {
                console.error('Failed to load chat history', e);
                setMessages([]);
            }
        };

        void load();
    }, [streamer, setMessages]);

    useEffect(() => {
        if (!streamer) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const wsBase =
            import.meta.env.VITE_WS_URL || 'ws://localhost:8081/ws';
        const wsUrl = buildWsUrl(wsBase, token);

        let alive = true;
        let reconnectTimer: number | undefined;

        const connect = () => {
            if (!alive) return;

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                if (!alive) {
                    ws.close(1000, 'leave');
                    return;
                }
                console.log('[chat] ws open', wsUrl);
                ws.send(
                    JSON.stringify({
                        type: 'join',
                        streamer_id: streamer.id,
                    }),
                );
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as any;

                    if (data?.type === 'joined') return;
                    if (data?.type === 'ack') return;
                    if (data?.type === 'error') {
                        console.error('chat error', data.error);
                        return;
                    }

                    if (data?.message_id && data?.content) {
                        const ev = data as ChatIngestEvent;
                        addMessage(mapIngestToChatMessage(ev));
                    }
                } catch (err) {
                    console.error('ws message parse error', err);
                }
            };

            ws.onerror = (err) => {
                console.error('ws error', err);
            };

            ws.onclose = (ev) => {
                console.warn('[chat] ws closed', ev.code, ev.reason);
                if (wsRef.current === ws) {
                    wsRef.current = null;
                }
                if (alive) {
                    reconnectTimer = window.setTimeout(connect, 1000);
                }
            };
        };

        connect();

        return () => {
            alive = false;
            if (reconnectTimer) window.clearTimeout(reconnectTimer);
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close(1000, 'leave');
                wsRef.current = null;
            }
        };
    }, [streamer, addMessage]);

    const handleSendMessage = useCallback(
        async (text: string) => {
            if (!user || !streamer || !text.trim()) return;

            const ws = wsRef.current;
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                console.warn(
                    '[chat] ws not open',
                    ws?.readyState ?? 'no-socket',
                );
                return;
            }

            console.log('[chat] send', text);
            ws.send(
                JSON.stringify({
                    type: 'chat',
                    content: text,
                }),
            );
        },
        [user, streamer],
    );

    const handleFollow = async () => {
        if (!user || !currentStream || !streamer) return;
        try {
            await StreamService.follow(streamer.id);
        } catch (e) {
            console.error('Follow error', e);
        }
    };

    return {
        streamer,
        stream: currentStream,
        messages,
        isLoading,
        error,
        user,
        handleSendMessage,
        handleFollow,
    };
};
