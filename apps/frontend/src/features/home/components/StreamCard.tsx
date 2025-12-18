import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@components/ui';
import { Stream } from '@types';

interface StreamCardProps {
    stream: Stream;
}

export const StreamCard: React.FC<StreamCardProps> = ({ stream }) => {
    return (
        <Link to={`/${stream.streamer.username}`} className="group block">
            <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-200 dark:bg-zinc-800">
                <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    LIVE
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded">
                    {stream.viewerCount.toLocaleString()} viewers
                </div>
            </div>
            <div className="flex gap-3">
                <Avatar src={stream.streamer.avatar} size="md" />
                <div className="overflow-hidden">
                    <h3 className="font-bold text-zinc-900 dark:text-white truncate group-hover:text-accent-500 transition-colors text-sm leading-tight">
                        {stream.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {stream.streamer.username}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 hover:text-accent-500 cursor-pointer inline-block">
                        {stream.category}
                    </p>
                    <div className="flex gap-1 mt-1.5">
                        {stream.tags.slice(0, 2).map((tag) => (
                            <span
                                key={tag}
                                className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
};
