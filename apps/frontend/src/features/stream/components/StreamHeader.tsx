import React from 'react';
import { Link } from 'react-router-dom';
import { Stream } from '@types';
import { Avatar, Button } from '@components/ui';
import { LuCheck, LuHeart, LuShare2, LuStar } from 'react-icons/lu';

interface StreamHeaderProps {
    stream: Stream;
    isFollowed: boolean;
    onFollow: () => void;
    onSubscribe: () => void;
}

export const StreamHeader: React.FC<StreamHeaderProps> = ({
    stream,
    isFollowed,
    onFollow,
    onSubscribe,
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex gap-4 max-w-2xl">
                <Avatar src={stream.streamer.avatar} size="lg" status={true} />
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                        {stream.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <Link
                            to={`/${stream.streamer.displayName}`}
                            className="font-semibold text-accent-500 hover:text-accent-600"
                        >
                            {stream.streamer.displayName}
                        </Link>
                        <span className="text-zinc-400 text-sm">•</span>
                        <span className="text-zinc-600 dark:text-zinc-400 text-sm">
                            {stream.category}
                        </span>
                        <div className="flex gap-1 flex-wrap ml-2">
                            {stream.tags.map((t) => (
                                <span
                                    key={t}
                                    className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-600 dark:text-zinc-400 font-medium"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
                <Button
                    variant={isFollowed ? 'secondary' : 'primary'}
                    className="flex-1 md:flex-none"
                    icon={
                        isFollowed ? (
                            <LuCheck className="w-4 h-4" />
                        ) : (
                            <LuHeart className="w-4 h-4" />
                        )
                    }
                    onClick={onFollow}
                >
                    {isFollowed ? 'Following' : 'Follow'}
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 md:flex-none"
                    icon={<LuStar className="w-4 h-4" />}
                    onClick={onSubscribe}
                >
                    Subscribe
                </Button>
                <Button
                    variant="ghost"
                    icon={<LuShare2 className="w-4 h-4" />}
                    className="hidden sm:flex"
                >
                    Share
                </Button>
            </div>
        </div>
    );
};
