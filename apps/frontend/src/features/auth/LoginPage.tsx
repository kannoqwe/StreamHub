import React, { useState } from 'react';
import { LuMail, LuLock, LuArrowRight } from 'react-icons/lu';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@components/layout/AuthLayout';
import { Button, Input } from '@components/ui';
import { useAuthStore } from '../../stores/useAuthStore';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(username, password);
        navigate('/');
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Log in to your account to continue"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="text"
                    placeholder="Username or Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                <div className="flex justify-end">
                    <a
                        href="#"
                        className="text-xs text-accent-500 hover:text-accent-600"
                    >
                        Forgot password?
                    </a>
                </div>
                <Button
                    type="submit"
                    className="w-full"
                    icon={<LuArrowRight className="w-4 h-4" />}
                >
                    Log In
                </Button>
            </form>
            <div className="text-center mt-6 text-sm text-zinc-500">
                Don't have an account?{' '}
                <Link
                    to="/signup"
                    className="text-accent-500 font-bold hover:text-accent-600"
                >
                    Sign up
                </Link>
            </div>
        </AuthLayout>
    );
};
