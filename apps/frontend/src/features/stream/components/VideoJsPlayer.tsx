import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import './styles/player.css';

interface VideoJSProps {
    options: videojs.PlayerOptions;
    onReady?: (player: videojs.Player) => void;
}

export const VideoJS: React.FC<VideoJSProps> = ({ options, onReady }) => {
    const videoRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<videojs.Player | null>(null);

    useEffect(() => {
        if (!playerRef.current && videoRef.current) {
            const videoElement = document.createElement('video-js');

            videoElement.classList.add('vjs-big-play-centered', 'vjs-fill');
            videoRef.current.appendChild(videoElement);

            const player = (playerRef.current = videojs(
                videoElement,
                options,
                () => {
                    onReady?.(player);
                },
            ));
        } else if (playerRef.current) {
            const player = playerRef.current;
            player.autoplay(options.autoplay ?? false);
            player.src(options.sources ?? []);
        }
    }, [options, onReady]);

    useEffect(() => {
        return () => {
            const player = playerRef.current;
            if (player) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, []);

    return (
        <div data-vjs-player className="w-full h-full">
            <div ref={videoRef} className="w-full h-full" />
        </div>
    );
};
