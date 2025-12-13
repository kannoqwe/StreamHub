import { Link, useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div
            className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 text-center
                            transition-colors duration-200"
        >
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64
                            bg-accent-500/10 rounded-full blur-3xl pointer-events-none"
            />

            <div className="relative mb-6">
                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-500 drop-shadow-sm">
                    404
                </h1>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-3">
                Page not found
            </h2>
            <p className="max-w-md text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                Sorry, we couldn't find the page you're looking for. It might
                have been removed or the link is broken.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="cursor-pointer px-6 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700
                        dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    Go back
                </button>

                <Link
                    to="/"
                    className="cursor-pointer px-6 py-2.5 rounded-lg bg-accent-600 text-white font-medium hover:bg-accent-500
                                shadow-lg shadow-accent-500/20 transition-all active:scale-95"
                >
                    Go home
                </Link>
            </div>
        </div>
    );
};
