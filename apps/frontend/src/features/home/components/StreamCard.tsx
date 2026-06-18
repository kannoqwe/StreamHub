import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@components/ui';
import { Stream } from '@types';

interface StreamCardProps {
    stream: Stream;
}

export const StreamCard: React.FC<StreamCardProps> = ({ stream }) => {
    return (
        <article className="group">
            <Link
                to={`/${stream.streamer.username}`}
                className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-200 dark:bg-zinc-800 block"
            >
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
            </Link>
            <div className="flex gap-3">
                <Link to={`/${stream.streamer.username}`} className="shrink-0">
                    <Avatar src={stream.streamer.avatar} size="md" />
                </Link>
                <div className="overflow-hidden">
                    <Link to={`/${stream.streamer.username}`}>
                        <h3 className="font-bold text-zinc-900 dark:text-white truncate group-hover:text-accent-500 transition-colors text-sm leading-tight">
                            {stream.title}
                        </h3>
                    </Link>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {stream.streamer.username}
                    </p>
                    <Link
                        to={`/browse/${encodeURIComponent(stream.category)}`}
                        className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 hover:text-accent-500 inline-block"
                    >
                        {stream.category}
                    </Link>
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
        </article>
    );
};
