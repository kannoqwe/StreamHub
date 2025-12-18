import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stream } from '@types';
import { Button } from '@components/ui';
import { StreamCard } from './StreamCard';

export const LiveChannels: React.FC<{ streams: Stream[] }> = ({ streams }) => {
    const navigate = useNavigate();
    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold dark:text-white">
                    Live Channels
                </h2>
                <Button
                    variant="ghost"
                    className="text-xs"
                    onClick={() => navigate('/browse')}
                >
                    View All
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
                {streams.map((stream) => (
                    <StreamCard key={stream.id} stream={stream} />
                ))}
            </div>
        </section>
    );
};
