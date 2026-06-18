import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LuArrowLeft, LuRadio } from 'react-icons/lu';
import { FullPageLoader } from '@components/ui';
import { StreamService } from '@features/stream/services/streamService';
import { Category, Stream } from '@types';
import { StreamCard } from '@features/home/components/StreamCard';

export const CategoryPage: React.FC = () => {
    const { categoryName } = useParams<{ categoryName: string }>();
    const decodedCategoryName = useMemo(
        () => decodeURIComponent(categoryName ?? ''),
        [categoryName],
    );
    const [category, setCategory] = useState<Category | null>(null);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!decodedCategoryName) {
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        Promise.all([
            StreamService.getCategories(),
            StreamService.getStreamsByCategory(decodedCategoryName),
        ])
            .then(([categories, nextStreams]) => {
                if (!isMounted) return;
                setCategory(
                    categories.find(
                        (item) =>
                            item.name.toLowerCase() ===
                            decodedCategoryName.toLowerCase(),
                    ) ?? null,
                );
                setStreams(nextStreams);
            })
            .catch(() => {
                if (!isMounted) return;
                setCategory(null);
                setStreams([]);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [decodedCategoryName]);

    if (isLoading) {
        return <FullPageLoader />;
    }

    const title = category?.name ?? decodedCategoryName;

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
            <Link
                to="/browse"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-accent-500"
            >
                <LuArrowLeft className="w-4 h-4" />
                Browse
            </Link>

            <header className="flex flex-col sm:flex-row gap-5 sm:items-end">
                {category && (
                    <div className="w-28 sm:w-36 aspect-[3/4] rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
                        <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="space-y-3 min-w-0">
                    <h1 className="text-3xl font-bold text-zinc-950 dark:text-white">
                        {title}
                    </h1>
                    <div className="inline-flex items-center gap-2 rounded bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-300">
                        <LuRadio className="w-4 h-4 text-red-500" />
                        {streams.length.toLocaleString()} live{' '}
                        {streams.length === 1 ? 'channel' : 'channels'}
                    </div>
                </div>
            </header>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
                    Live channels in {title}
                </h2>

                {streams.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
                        {streams.map((stream) => (
                            <StreamCard key={stream.id} stream={stream} />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        No live channels in this category right now.
                    </p>
                )}
            </section>
        </div>
    );
};
