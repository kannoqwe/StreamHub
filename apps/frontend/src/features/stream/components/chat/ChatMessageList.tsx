import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@types';

export const ChatMessageList: React.FC<{ messages: ChatMessage[] }> = ({
    messages,
}) => {
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-2 font-medium text-sm custom-scrollbar"
        >
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className="break-words text-sm animate-in fade-in slide-in-from-bottom-1"
                >
                    <span
                        style={{ color: msg.color }}
                        className="font-bold cursor-pointer hover:underline mr-1"
                    >
                        {msg.user}:
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300">
                        {msg.text}
                    </span>
                </div>
            ))}
        </div>
    );
};
