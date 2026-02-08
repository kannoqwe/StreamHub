import React from 'react';
import { LuMoon as MoonIcon, LuSun as SunIcon } from 'react-icons/lu';
import { useTheme } from '../../../contexts/theme-context';
import { useAuthStore } from '../../../stores/useAuthStore';
import { NavbarLogo } from './NavbarLogo';
import { NavbarSearch } from './NavbarSearch';
import { UserMenu } from './UserMenu';
import { AuthButtons } from './NavbarAuth';

interface NavbarProps {
    toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
    const { isDark, toggleTheme } = useTheme();
    const { user, isLoading } = useAuthStore();

    return (
        <nav className="h-14 fixed top-0 left-0 right-0 z-50 glass border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between">
            <NavbarLogo toggleSidebar={toggleSidebar} />

            <NavbarSearch />

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

                {isLoading ? (
                    <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                ) : user ? (
                    <UserMenu user={user} />
                ) : (
                    <AuthButtons />
                )}
            </div>
        </nav>
    );
};
