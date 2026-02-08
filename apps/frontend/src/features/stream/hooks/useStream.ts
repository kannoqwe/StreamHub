import { useEffect, useCallback, useRef, useState } from 'react';
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

const isChatIngestEvent = (value: unknown): value is ChatIngestEvent => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const data = value as Record<string, unknown>;

    return (
        typeof data.message_id === 'string' &&
        typeof data.streamer_id === 'number' &&
        typeof data.user_id === 'number' &&
        typeof data.username === 'string' &&
        typeof data.content === 'string' &&
        typeof data.timestamp === 'string'
    );
};

export const useStream = () => {
    const { username } = useParams<{ username: string }>();
    const { user } = useAuthStore();

    const wsRef = useRef<WebSocket | null>(null);
    const [isFollowed, setIsFollowed] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

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
    const isOwnChannel =
        !!user &&
        !!streamer &&
        (user.id === streamer.id || user.username === streamer.username);

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
            } catch {
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
                ws.send(
                    JSON.stringify({
                        type: 'join',
                        streamer_id: streamer.id,
                    }),
                );
            };

            ws.onmessage = (event) => {
                try {
                    if (typeof event.data !== 'string') return;
                    const data: unknown = JSON.parse(event.data);

                    if (typeof data !== 'object' || data === null) {
                        return;
                    }

                    const packet = data as Record<string, unknown>;

                    if (packet.type === 'joined') return;
                    if (packet.type === 'ack') return;
                    if (packet.type === 'error') return;

                    if (isChatIngestEvent(data)) {
                        addMessage(mapIngestToChatMessage(data));
                    }
                } catch {
                    return;
                }
            };

            ws.onclose = () => {
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

    useEffect(() => {
        if (!streamer || !user || isOwnChannel) {
            setIsFollowed(false);
            setIsFollowLoading(false);
            return;
        }

        let cancelled = false;
        const loadFollowStatus = async () => {
            setIsFollowLoading(true);
            try {
                const data = await StreamService.followStatus(streamer.id);
                if (!cancelled) {
                    setIsFollowed(data.following);
                }
            } catch {
                if (!cancelled) {
                    setIsFollowed(false);
                }
            } finally {
                if (!cancelled) {
                    setIsFollowLoading(false);
                }
            }
        };

        void loadFollowStatus();

        return () => {
            cancelled = true;
        };
    }, [streamer, user, isOwnChannel]);

    const handleSendMessage = useCallback(
        async (text: string) => {
            if (!user || !streamer || !text.trim()) return;

            const ws = wsRef.current;
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                return;
            }

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
        if (!user || !streamer || isOwnChannel || isFollowLoading) {
            return;
        }

        setIsFollowLoading(true);
        try {
            const data = isFollowed
                ? await StreamService.unfollow(streamer.id)
                : await StreamService.follow(streamer.id);
            setIsFollowed(data.following);
        } catch {
            return;
        } finally {
            setIsFollowLoading(false);
        }
    };

    return {
        streamer,
        stream: currentStream,
        messages,
        isLoading,
        error,
        user,
        isFollowed,
        isFollowLoading,
        canFollow: !!user && !!streamer && !isOwnChannel,
        handleSendMessage,
        handleFollow,
    };
};
