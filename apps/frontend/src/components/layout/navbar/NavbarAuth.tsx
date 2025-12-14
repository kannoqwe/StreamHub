import { Link } from 'react-router-dom';
import { Button } from '@components/ui';

export const AuthButtons = () => {
    return (
        <div className="flex gap-3 items-center">
            <Link
                to="/login"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-accent-500 transition-colors"
            >
                Log In
            </Link>
            <Link to="/signup">
                <Button variant="primary" className="text-xs px-3 py-1.5">
                    Sign Up
                </Button>
            </Link>
        </div>
    );
};
