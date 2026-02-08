import React, { useMemo } from 'react';
import videojs from 'video.js';
import { VideoJS } from './VideoJsPlayer';

interface StreamPlayerProps {
    streamKey: string;
    isLive: boolean;
    thumbnail: string;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({
    streamKey,
    isLive,
    thumbnail,
}) => {
    const playerOptions: videojs.PlayerOptions = useMemo(
        () => ({
            autoplay: true,
            controls: true,
            responsive: true,
            muted: true,
            fluid: false,
            liveui: true,
            sources: [
                {
                    src: `http://localhost:8080/hls/${streamKey}.m3u8`,
                    type: 'application/x-mpegURL',
                },
            ],
            controlBar: {
                volumePanel: {
                    inline: false,
                },
            },
        }),
        [streamKey],
    );

    return (
        <div className="w-full h-full bg-black relative overflow-hidden rounded-xl shadow-2xl">
            {isLive ? (
                <VideoJS options={playerOptions} />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    <img
                        src={thumbnail}
                        className="w-full h-full object-cover opacity-30 blur-sm"
                        alt="Offline"
                    />
                    <div className="absolute z-10 flex flex-col items-center gap-3">
                        <div className="bg-zinc-800/80 backdrop-blur-md border border-white/10 px-4 py-1 rounded text-white text-[10px] font-bold uppercase tracking-widest">
                            Offline
                        </div>
                        <p className="text-zinc-500 text-sm">
                            Streamer is offline
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
