import React from 'react';
import { ChatMessage } from '@types';
import { ChatMessageList } from '@features/stream/components/chat/ChatMessageList';
import { ChatInput } from '@features/stream/components/chat/ChatInput';

interface ChatProps {
    messages: ChatMessage[];
    onSendMessage: (msg: string) => void;
    isLoggedIn: boolean;
}

export const Chat: React.FC<ChatProps> = ({
    messages,
    onSendMessage,
    isLoggedIn,
}) => {
    return (
        <div className="w-80 border-l border-zinc-200 dark:border-zinc-800 flex flex-col hidden lg:flex bg-white dark:bg-zinc-950 shrink-0">
            <div className="h-10 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-semibold text-zinc-700 dark:text-zinc-300 text-sm uppercase tracking-wider">
                Stream Chat
            </div>

            <ChatMessageList messages={messages} />

            <ChatInput onSend={onSendMessage} isLoggedIn={isLoggedIn} />
        </div>
    );
};
