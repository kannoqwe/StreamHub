import { useEffect } from 'react';
import { useGlobalStore } from '../../../stores/useGlobalStore';
import { SidebarStreamItem } from './SidebarStreamItem';

export const RecommendedList = () => {
    const { recommended, isLoading, fetchRecommended } = useGlobalStore();
    const showSkeleton = isLoading || recommended.length === 0;

    useEffect(() => {
        void fetchRecommended();
    }, [fetchRecommended]);

    return (
        <div>
            <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Recommended
            </p>

            {showSkeleton
                ? [1, 2, 3].map((i) => (
                      <div
                          key={i}
                          className="flex items-center gap-3 px-2 py-1.5 opacity-60"
                      >
                          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                          <div className="flex-1 space-y-1">
                              <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                              <div className="h-2 w-12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                          </div>
                      </div>
                  ))
                : recommended.map((stream) => (
                      <SidebarStreamItem key={stream.id} stream={stream} />
                  ))}
        </div>
    );
};
