import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuRadio, LuSearch } from 'react-icons/lu';
import { FullPageLoader } from '@components/ui';
import { StreamService } from '@features/stream/services/streamService';
import { Category, Stream } from '@types';
import { StreamCard } from '@features/home/components/StreamCard';

export const BrowsePage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'categories' | 'live'>(
        'categories',
    );

    useEffect(() => {
        let isMounted = true;

        Promise.all([
            StreamService.getCategories(),
            StreamService.getRecommendedStreams(),
        ])
            .then(([nextCategories, nextStreams]) => {
                if (!isMounted) return;
                setCategories(nextCategories);
                setStreams(nextStreams);
            })
            .catch(() => {
                if (!isMounted) return;
                setCategories([]);
                setStreams([]);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const liveCategoryNames = useMemo(
        () => new Set(streams.map((stream) => stream.category)),
        [streams],
    );

    if (isLoading) {
        return <FullPageLoader />;
    }

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-10">
            <header className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-950 dark:text-white">
                        Browse
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                        Find live channels by category.
                    </p>
                </div>

                <div className="flex gap-5 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={() => setActiveTab('categories')}
                        className={`px-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'categories'
                                ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                    >
                        Categories
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('live')}
                        className={`px-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'live'
                                ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                    >
                        Live Channels
                    </button>
                </div>
            </header>

            {activeTab === 'categories' ? (
                <section>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
                        {categories.map((category) => {
                            const hasLiveStreams = liveCategoryNames.has(
                                category.name,
                            );

                            return (
                                <Link
                                    key={category.id}
                                    to={`/browse/${encodeURIComponent(category.name)}`}
                                    className="group block"
                                >
                                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {hasLiveStreams && (
                                            <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                <LuRadio className="w-3 h-3" />
                                                LIVE
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-accent-500 truncate">
                                        {category.name}
                                    </h2>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            ) : (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <LuSearch className="w-5 h-5 text-zinc-500" />
                        <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
                            Live Channels
                        </h2>
                    </div>

                    {streams.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
                            {streams.map((stream) => (
                                <StreamCard key={stream.id} stream={stream} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            No live channels right now.
                        </p>
                    )}
                </section>
            )}
        </div>
    );
};
