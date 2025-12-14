import { LuSearch as SearchIcon } from 'react-icons/lu';

export const NavbarSearch = () => {
    return (
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
    );
};
