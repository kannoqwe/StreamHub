import React from 'react';
import { SidebarNav } from './SidebarNav';
import { FollowingList } from './FollowingList';
import { RecommendedList } from './RecommendedList';

interface SidebarProps {
    isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    if (!isOpen) return null;

    return (
        <aside className="fixed top-14 left-0 bottom-0 w-60 glass border-r border-zinc-200 dark:border-zinc-800 hidden lg:flex flex-col z-40 bg-white/80 dark:bg-zinc-950/80">
            <SidebarNav />

            <div className="flex-1 overflow-y-auto px-3 py-4 border-t border-zinc-200 dark:border-zinc-800 custom-scrollbar">
                <FollowingList />

                <RecommendedList />
            </div>
        </aside>
    );
};
