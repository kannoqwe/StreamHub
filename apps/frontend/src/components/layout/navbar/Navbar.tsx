import React, { useState } from 'react';
import {
    LuAlignJustify as MenuIcon,
    LuMoon as MoonIcon,
    LuSun as SunIcon,
    LuSearch as SearchIcon,
    LuBell,
    LuUser,
    LuSettings,
    LuLogOut,
} from 'react-icons/lu';
import { Link, useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.svg';
import { Button, Avatar } from '@components/ui';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';

interface NavbarProps {
    toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuthStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <nav className="h-14 fixed top-0 left-0 right-0 z-50 glass border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-300"
                >
                    <MenuIcon className="w-5 h-5" />
                </button>
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="text-accent-500 group-hover:scale-105 transition-transform duration-300">
                        <img src={logo} className="w-8 h-8" alt="logo" />
                    </div>
                    <span className="font-bold text-xl text-zinc-900 dark:text-white hidden sm:block tracking-tight">
                        Stream<span className="text-accent-500">Hub</span>
                    </span>
                </Link>
            </div>

            <div className="flex-1 max-w-lg mx-6 hidden md:block">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-zinc-100 dark:bg-zinc-800/50 border-none rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 text-sm"
                    />
                    <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 group-focus-within:text-accent-500 transition-colors" />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-300"
                >
                    {isDark ? (
                        <SunIcon className="w-5 h-5" />
                    ) : (
                        <MoonIcon className="w-5 h-5" />
                    )}
                </button>

                {user ? (
                    <>
                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-300 relative">
                            <LuBell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-accent-500 rounded-full border border-white dark:border-zinc-900"></span>
                        </button>
                        <div className="relative ml-2">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 focus:outline-none"
                            >
                                <Avatar src={user.avatar} size="sm" />
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsProfileOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                                            <Avatar
                                                src={user.avatar}
                                                size="md"
                                            />
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-zinc-900 dark:text-white truncate">
                                                    {user.username}
                                                </p>
                                                <p className="text-xs text-green-500 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>{' '}
                                                    Online
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-1.5 space-y-0.5">
                                            <Link
                                                to="/profile"
                                                onClick={() =>
                                                    setIsProfileOpen(false)
                                                }
                                                className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors text-sm"
                                            >
                                                <LuUser className="w-4 h-4" />{' '}
                                                Profile
                                            </Link>
                                            <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors text-sm">
                                                <LuSettings className="w-4 h-4" />{' '}
                                                Settings
                                            </button>
                                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1 mx-2"></div>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setIsProfileOpen(false);
                                                    navigate('/');
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 rounded-lg transition-colors text-sm"
                                            >
                                                <LuLogOut className="w-4 h-4" />{' '}
                                                Log Out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex gap-3 items-center">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-accent-500 transition-colors"
                        >
                            Log In
                        </Link>
                        <Link to="/signup">
                            <Button
                                variant="primary"
                                className="text-xs px-3 py-1.5"
                            >
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};
