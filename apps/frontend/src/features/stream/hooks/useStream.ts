import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStreamStore } from '../stores/useStreamStore';
import { ChatMessage } from '@types';
import { useAuthStore } from '../../../stores/useAuthStore';

export const useStream = () => {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const {
        currentStream,
        messages,
        addMessage,
        fetchStreamByUsername,
        isLoading,
    } = useStreamStore();

    useEffect(() => {
        if (username) {
            void fetchStreamByUsername(username);
        }
    }, [username, fetchStreamByUsername]);

    const handleSendMessage = (text: string) => {
        if (!user) return;

        const newMessage: ChatMessage = {
            id: 1,
            user: user.displayName,
            color: '#e43f6f',
            text,
            timestamp: Date.now(),
        };

        addMessage(newMessage);
    };

    const handleFollow = () => {
        if (!user) return navigate('/login');
        console.log('Followed');
    };

    return {
        stream: currentStream,
        messages,
        isLoading,
        user,
        handleSendMessage,
        handleFollow,
    };
};
