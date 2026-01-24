import { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useStreamStore } from '../stores/useStreamStore';
import { useAuthStore } from '../../../stores/useAuthStore';
import { StreamService } from '../services/streamService';

export const useStream = () => {
    const { username } = useParams<{ username: string }>();
    const { user } = useAuthStore();

    const {
        streamer,
        currentStream,
        messages,
        isLoading,
        error,
        fetchStream,
        addMessage,
        reset,
    } = useStreamStore();

    useEffect(() => {
        if (username) {
            void fetchStream(username);
        }
        return () => reset();
    }, [username, fetchStream, reset]);

    const handleSendMessage = useCallback(
        async (text: string) => {
            if (!user || !currentStream || !text.trim()) return;

            try {
                const newMessage = await StreamService.sendMessage(
                    currentStream.id,
                    text,
                );
                addMessage(newMessage);
            } catch (e) {
                console.error('Failed to send message', e);
            }
        },
        [user, currentStream, addMessage],
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
