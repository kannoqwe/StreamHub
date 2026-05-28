import React from 'react';
import { useStream } from './hooks/useStream';
import { StreamPlayer } from './components/StreamPlayer';
import { StreamHeader } from './components/StreamHeader';
import { Chat } from '@features/stream/components/chat/Chat';
import { FullPageLoader } from '@components/ui';

export const StreamPage: React.FC = () => {
    const {
        streamer,
        stream,
        messages,
        handleSendMessage,
        handleFollow,
        isFollowed,
        isFollowLoading,
        canFollow,
        user,
        isLoading,
    } = useStream();

    if (isLoading) return <FullPageLoader />;

    if (!streamer) {
        return (
            <div className="flex-1 flex items-center justify-center text-zinc-500 font-medium">
                User not found
            </div>
        );
    }

    const isLive = !!stream;
    const playbackId = stream?.playbackId ?? '';
    const thumbnail = stream?.thumbnail ?? streamer.avatar;

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-zinc-50 dark:bg-zinc-950">
            <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                <div className="w-full max-w-[1300px] mx-auto lg:pt-4 pb-4">
                    <div className="aspect-video w-full shadow-2xl shadow-black/20">
                        <StreamPlayer
                            playbackId={playbackId}
                            isLive={isLive}
                            thumbnail={thumbnail}
                        />
                    </div>
                </div>

                <div className="px-4 lg:px-6 max-w-[1300px] mx-auto w-full pb-10">
                    <StreamHeader
                        streamer={streamer}
                        stream={stream}
                        isFollowed={isFollowed}
                        isFollowLoading={isFollowLoading}
                        canFollow={canFollow}
                        onFollow={handleFollow}
                        onSubscribe={() => alert('Subscribed!')}
                    />

                    <section className="mt-8 bg-white dark:bg-zinc-900/40 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 dark:text-white">
                            About {streamer.displayName}
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            {streamer.bio ||
                                "This streamer hasn't added a bio yet."}
                        </p>
                    </section>
                </div>
            </main>

            <Chat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoggedIn={!!user}
            />
        </div>
    );
};
