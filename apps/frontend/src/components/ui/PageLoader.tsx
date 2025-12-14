export const FullPageLoader = () => {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 gap-4">
            <div className="flex items-center gap-2 animate-pulse">
                <span className="text-xl font-bold text-white tracking-tight">
                    Stream<span className="text-accent-600">Hub</span>
                </span>
            </div>

            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-accent-600" />
        </div>
    );
};
