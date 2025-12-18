import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stream } from '@types';
import { Avatar, Button } from '@components/ui';
import { LuVideo } from 'react-icons/lu';

interface FeaturedHeroProps {
    stream: Stream | null;
}

export const FeaturedHero: React.FC<FeaturedHeroProps> = ({ stream }) => {
    const navigate = useNavigate();
    if (!stream) return null;

    return (
        <section className="relative rounded-2xl overflow-hidden h-[400px] md:h-[450px] flex items-end">
            <img
                src={stream.thumbnail}
                alt="Hero"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative z-10 p-8 w-full md:w-2/3 lg:w-1/2 space-y-3">
                <span className="bg-accent-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block">
                    Featured
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                    {stream.title}
                </h1>
                <div className="flex items-center gap-3 pt-1">
                    <Avatar src={stream.streamer.avatar} size="md" />
                    <div>
                        <p className="text-white font-medium text-base">
                            {stream.streamer.username}
                        </p>
                        <p className="text-zinc-300 text-sm">
                            {stream.category} •{' '}
                            {stream.viewerCount.toLocaleString()} Viewers
                        </p>
                    </div>
                </div>
                <div className="pt-3">
                    <Button
                        variant="primary"
                        icon={<LuVideo className="w-4 h-4" />}
                        onClick={() => navigate(`/stream/${stream.streamer}`)}
                    >
                        Watch Now
                    </Button>
                </div>
            </div>
        </section>
    );
};
