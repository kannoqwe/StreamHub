import React, { useEffect } from 'react';
import { useHomeStore } from './stores/useHomeStore';
import { FeaturedHero } from './components/FeaturedHero';
import { CategoryGrid } from './components/CategoryGrid';
import { LiveChannels } from './components/LiveChannels';
import { FullPageLoader } from '@components/ui';

export const HomePage: React.FC = () => {
    const { featuredStream, streams, categories, isLoading, fetchHomeData } =
        useHomeStore();

    useEffect(() => {
        void fetchHomeData();
    }, [fetchHomeData]);

    if (isLoading) {
        return <FullPageLoader />;
    }

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-12">
            <FeaturedHero stream={featuredStream} />

            <CategoryGrid categories={categories} />

            <LiveChannels streams={streams} />
        </div>
    );
};
