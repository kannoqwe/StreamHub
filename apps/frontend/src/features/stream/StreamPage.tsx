import React from 'react';
import { useStream } from './hooks/useStream';
import { StreamPlayer } from './components/StreamPlayer';
import { StreamHeader } from './components/StreamHeader';
import { Chat } from '@features/stream/components/chat/Chat';
import { FullPageLoader } from '@components/ui';

export const StreamPage: React.FC = () => {
    const {
        stream,
        messages,
        handleSendMessage,
        handleFollow,
        user,
        isLoading,
    } = useStream();

    if (isLoading) return <FullPageLoader />;

    if (!stream) {
        return (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
                Channel not found
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            <main className="flex-1 flex flex-col overflow-y-auto">
                <StreamPlayer thumbnail={stream.thumbnail} isLive={false} />

                <div className="p-6 max-w-[1600px] mx-auto w-full">
                    <StreamHeader
                        stream={stream}
                        isFollowed={false}
                        onFollow={handleFollow}
                        onSubscribe={() => alert('Subscribed!')}
                    />

                    <section className="mt-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
                        <h3 className="font-bold text-base mb-2 dark:text-white">
                            About {stream.streamer.displayName}
                        </h3>
                        <div className="flex gap-6 text-sm mb-3">
                            <div>
                                <span className="font-bold text-zinc-900 dark:text-white mr-1">
                                    {stream.streamer.followers.toLocaleString()}
                                </span>
                                <span className="text-zinc-500">Followers</span>
                            </div>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
                            {stream.streamer.bio ||
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
