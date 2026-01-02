import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@components/ui';
import { Stream } from '@types';

interface SidebarStreamItemProps {
    stream: Stream;
}

export const SidebarStreamItem: React.FC<SidebarStreamItemProps> = ({
    stream,
}) => {
    return (
        <Link
            to={`/${stream.streamer.username}`}
            className="flex items-center gap-3 px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors group"
        >
            <Avatar
                src={stream.streamer.avatar}
                size="sm"
                status={stream.streamer.isOnline}
            />

            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-medium text-zinc-700 dark:text-zinc-300 text-sm truncate">
                        {stream.streamer.username}
                    </p>
                    {stream.streamer.isOnline && (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {Math.floor(stream.viewerCount / 1000)}k
                        </span>
                    )}
                </div>
                <p className="text-[10px] text-zinc-400 truncate group-hover:text-accent-500 transition-colors">
                    {stream.category}
                </p>
            </div>
        </Link>
    );
};
