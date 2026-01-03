import React, { useMemo, useCallback } from 'react';
import videojs from 'video.js';
import { VideoJS } from './VideoJsPlayer';

interface StreamPlayerProps {
    streamKey: string;
    isLive: boolean;
    thumbnail?: string;
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
            fluid: true,
            liveui: true,
            sources: [
                {
                    src: `http://localhost:8080/hls/${streamKey}.m3u8`,
                    type: 'application/x-mpegURL',
                },
            ],
        }),
        [streamKey],
    );

    const handlePlayerReady = useCallback((player: videojs.Player) => {
        player.on('waiting', () => {
            videojs.log('Стрим подгружается...');
        });

        player.on('error', () => {
            const error = player.error();
            console.warn('VideoJS Error:', error);
        });
    }, []);

    return (
        <div className="w-full bg-zinc-950 aspect-video relative group overflow-hidden shadow-2xl rounded-xl border border-white/5">
            {isLive ? (
                <VideoJS options={playerOptions} onReady={handlePlayerReady} />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src={thumbnail}
                        className="w-full h-full object-cover opacity-20 blur-sm"
                        alt="Offline"
                    />
                    <div className="absolute z-10 flex flex-col items-center gap-3">
                        <div className="bg-zinc-800/80 backdrop-blur-md border border-white/10 px-4 py-1 rounded text-white text-[10px] font-bold uppercase tracking-widest">
                            Offline
                        </div>
                        <p className="text-zinc-500 text-sm">
                            Стример сейчас отдыхает
                        </p>
                    </div>
                </div>
            )}

            {isLive && (
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                    <div className="flex items-center gap-2 bg-red-600 px-2 py-1 rounded text-[10px] font-bold text-white uppercase shadow-lg shadow-red-900/20">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Live
                    </div>
                </div>
            )}
        </div>
    );
};
