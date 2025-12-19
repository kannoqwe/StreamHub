import { Link } from 'react-router-dom';
import { Button } from '@components/ui';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useGlobalStore } from '../../../stores/useGlobalStore';
import { SidebarStreamItem } from './SidebarStreamItem';
import { useEffect } from 'react';

export const FollowingList = () => {
    const { user } = useAuthStore();
    const { followed, isLoading, fetchFollowed } = useGlobalStore();

    useEffect(() => {
        if (user) {
            void fetchFollowed();
        }
    }, [fetchFollowed, user]);

    return (
        <div className="mb-6">
            <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Following
            </p>

            {!user ? (
                <div className="p-3 text-center bg-zinc-50 dark:bg-zinc-900 rounded-lg mx-1">
                    <p className="text-xs text-zinc-500 mb-2">
                        Log in to follow channels
                    </p>
                    <Link to="/login">
                        <Button
                            variant="outline"
                            className="w-full text-xs py-1 h-7"
                        >
                            Log In
                        </Button>
                    </Link>
                </div>
            ) : isLoading ? (
                [1, 2].map((i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 px-2 py-1.5 opacity-60"
                    >
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        <div className="flex-1 space-y-1">
                            <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                        </div>
                    </div>
                ))
            ) : (
                followed.map((stream) => (
                    <SidebarStreamItem key={stream.id} stream={stream} />
                ))
            )}

            {user && !isLoading && followed.length === 0 && (
                <div className="px-3 text-xs text-zinc-500">
                    You don't follow anyone yet.
                </div>
            )}
        </div>
    );
};
