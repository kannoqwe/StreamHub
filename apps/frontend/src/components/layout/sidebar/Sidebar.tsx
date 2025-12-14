import { Link, useLocation } from 'react-router-dom';
import React from 'react';
import { LuHouse, LuCompass } from 'react-icons/lu';
import { Button } from '@components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { Avatar } from '@components/ui';
import { MOCK_STREAMS } from '../../mock';

interface SidebarProps {
    isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const { user } = useAuthStore();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    if (!isOpen) return null;

    return (
        <aside className="fixed top-14 left-0 bottom-0 w-60 glass border-r border-zinc-200 dark:border-zinc-800 hidden lg:flex flex-col z-40 bg-white/80 dark:bg-zinc-950/80">
            <div className="p-3 space-y-1">
                <Link
                    to="/"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/')
                            ? 'bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                    }`}
                >
                    <LuHouse className="w-4 h-4" /> Home
                </Link>
                <Link
                    to="/browse"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/browse')
                            ? 'bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                    }`}
                >
                    <LuCompass className="w-4 h-4" /> Browse
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto px-3 space-y-1 py-4 border-t border-zinc-200 dark:border-zinc-800 custom-scrollbar">
                <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Following
                </p>
                {user ? (
                    MOCK_STREAMS.map((stream) => (
                        <Link
                            key={stream.id}
                            to={`/stream/${stream.id}`}
                            className="flex items-center gap-3 px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors group"
                        >
                            <Avatar
                                src={stream.streamer.avatar}
                                size="sm"
                                status={true}
                            />
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium text-zinc-700 dark:text-zinc-300 text-sm truncate">
                                        {stream.streamer.username}
                                    </p>
                                    <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                        {Math.floor(stream.viewerCount / 1000)}k
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-400 truncate group-hover:text-accent-500 transition-colors">
                                    {stream.category}
                                </p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="p-3 text-center bg-zinc-50 dark:bg-zinc-900 rounded-lg mx-1">
                        <p className="text-xs text-zinc-500 mb-2">
                            Log in to follow
                        </p>
                        <Link to="/login">
                            <Button
                                variant="outline"
                                className="w-full text-xs py-1 h-7"
                            >
                                Log In
                            </Button>
                        </Link>
                    </div>
                )}

                <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-6 mb-2">
                    Recommended
                </p>
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors opacity-60 hover:opacity-100 cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                        <div className="flex-1">
                            <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded mb-1"></div>
                            <div className="h-2 w-12 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};
