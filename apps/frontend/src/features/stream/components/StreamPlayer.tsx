import React from 'react';
import { LuMonitor, LuSettings } from 'react-icons/lu';

interface StreamPlayerProps {
    thumbnail: string;
    isLive?: boolean;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({
    thumbnail,
    isLive = false,
}) => {
    return (
        <div className="w-full bg-black aspect-video relative group">
            <div className="absolute inset-0 flex items-center justify-center">
                <img
                    src={thumbnail}
                    className="w-full h-full object-cover opacity-60"
                    alt="Stream preview"
                />
                {!isLive && (
                    <div className="absolute z-10 text-center">
                        <p className="text-zinc-400 text-sm font-medium mb-2">
                            Stream Offline
                        </p>
                    </div>
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center text-white">
                <div className="flex gap-4">
                    <button className="hover:text-accent-500 font-bold text-sm">
                        PLAY
                    </button>
                </div>
                <div className="flex gap-3 text-zinc-300">
                    <LuSettings className="w-5 h-5 cursor-pointer hover:text-white" />
                    <LuMonitor className="w-5 h-5 cursor-pointer hover:text-white" />
                </div>
            </div>
        </div>
    );
};
