import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuBell, LuUser, LuSettings, LuLogOut } from 'react-icons/lu';
import { Avatar } from '@components/ui';
import { useAuthStore } from '../../../stores/useAuthStore';
import { User } from '@types';

interface UserMenuProps {
    user: User;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
        navigate('/');
    };

    return (
        <>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-300 relative">
                <LuBell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-accent-500 rounded-full border border-white dark:border-zinc-900"></span>
            </button>

            <div className="relative ml-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                >
                    <Avatar src={user.avatar} size="sm" />
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                                <Avatar src={user.avatar} size="md" />
                                <div className="overflow-hidden">
                                    <p className="font-bold text-zinc-900 dark:text-white truncate">
                                        {user.username}
                                    </p>
                                    <p className="text-xs text-green-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />{' '}
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="p-1.5 space-y-0.5">
                                <Link
                                    to={`/${user.username}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors text-sm"
                                >
                                    <LuUser className="w-4 h-4" /> Profile
                                </Link>
                                <Link
                                    to="/settings"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors text-sm"
                                >
                                    <LuSettings className="w-4 h-4" /> Settings
                                </Link>
                                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1 mx-2" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 rounded-lg transition-colors text-sm"
                                >
                                    <LuLogOut className="w-4 h-4" /> Log Out
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};
