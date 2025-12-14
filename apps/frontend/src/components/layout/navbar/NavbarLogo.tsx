import React from 'react';
import { Link } from 'react-router-dom';
import { LuAlignJustify as MenuIcon } from 'react-icons/lu';
import logo from '@/assets/logo.svg';

interface NavbarLogoProps {
    toggleSidebar: () => void;
}

export const NavbarLogo: React.FC<NavbarLogoProps> = ({ toggleSidebar }) => {
    return (
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
    );
};
