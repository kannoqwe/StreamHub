import { AuthLayout } from '@components/layout/AuthLayout';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuUser, LuMail, LuLock, LuCheck } from 'react-icons/lu';
import { Button, Input } from '@components/ui';
import { useAuthStore } from '../../stores/useAuthStore';

export const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await register(username, email, password);
        navigate('/');
    };

    return (
        <AuthLayout title="Create Account" subtitle="Join the community today">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    icon={<LuUser className="w-4 h-4" />}
                    required
                />
                <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<LuMail className="w-4 h-4" />}
                    required
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<LuLock className="w-4 h-4" />}
                    required
                />
                <div className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                    <input
                        type="checkbox"
                        required
                        className="mt-0.5 rounded border-zinc-300 text-accent-500 focus:ring-accent-500
                                dark:border-zinc-600 dark:bg-zinc-900 dark:checked:bg-accent-500"
                    />
                    <span>
                        I agree to the{' '}
                        <a
                            href="#"
                            className="text-accent-500 hover:text-accent-600"
                        >
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a
                            href="#"
                            className="text-accent-500 hover:text-accent-600"
                        >
                            Privacy Policy
                        </a>
                        .
                    </span>
                </div>
                <Button
                    type="submit"
                    className="w-full"
                    icon={<LuCheck className="w-4 h-4" />}
                >
                    Create Account
                </Button>
            </form>
            <div className="text-center mt-6 text-sm text-zinc-500">
                Already have an account?{' '}
                <Link
                    to="/login"
                    className="text-accent-500 font-bold hover:text-accent-600"
                >
                    Log in
                </Link>
            </div>
        </AuthLayout>
    );
};
