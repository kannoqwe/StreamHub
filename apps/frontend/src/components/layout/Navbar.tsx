import React from 'react';
import {
    LuAlignJustify as MenuIcon,
    LuMoon as MoonIcon,
    LuSearch as SearchIcon,
} from 'react-icons/lu';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.svg';
import { Button } from '@components/ui/Button';

interface NavbarProps {
    toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
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
                        <img className="w-8 h-8" src={logo} alt="Logo" />
                    </div>
                    <span className="font-bold text-xl text-zinc-900 dark:text-white hidden sm:block tracking-tight">
                        StreamHub
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
                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-zinc-600 dark:text-zinc-300">
                    <MoonIcon className="w-5 h-5" />
                </button>

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
            </div>
        </nav>
    );
};
