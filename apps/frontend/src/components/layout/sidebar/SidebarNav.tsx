import { Link, useLocation } from 'react-router-dom';
import { LuHouse, LuCompass } from 'react-icons/lu';

export const SidebarNav = () => {
    const location = useLocation();

    const getLinkClass = (path: string) => {
        const isActive = location.pathname === path;
        return `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive
                ? 'bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
        }`;
    };

    return (
        <div className="p-3 space-y-1">
            <Link to="/" className={getLinkClass('/')}>
                <LuHouse className="w-4 h-4" /> Home
            </Link>
            <Link to="/browse" className={getLinkClass('/browse')}>
                <LuCompass className="w-4 h-4" /> Browse
            </Link>
        </div>
    );
};
