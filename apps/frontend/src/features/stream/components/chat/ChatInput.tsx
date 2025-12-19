import React, { useState } from 'react';
import { Button } from '@components/ui';
import { Link } from 'react-router-dom';
import { LuSend } from 'react-icons/lu';

export const ChatInput: React.FC<{
    onSend: (msg: string) => void;
    isLoggedIn: boolean;
}> = ({ onSend, isLoggedIn }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSend(input);
            setInput('');
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="p-4 border-t dark:border-zinc-800">
                <Link to="/login">
                    <Button variant="primary" className="w-full text-xs">
                        Log In to Chat
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 border-t dark:border-zinc-800 relative"
        >
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Send a message"
                className="w-full bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-lg py-2 pl-3 pr-10 text-sm dark:text-white focus:ring-1 focus:ring-accent-500 outline-none"
            />
            <button
                type="submit"
                disabled={!input.trim()}
                className="absolute right-6 top-6"
            >
                <LuSend className="w-4 h-4 text-accent-500" />
            </button>
        </form>
    );
};
