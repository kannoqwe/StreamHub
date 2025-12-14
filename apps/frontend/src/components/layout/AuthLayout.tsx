import React, { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title,
    subtitle,
}) => (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                    {title}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                    {subtitle}
                </p>
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    </div>
);
