import { ReactNode } from 'react';

interface SettingsSectionProps {
    title: string;
    children: ReactNode;
}

export const SettingsSection = ({ title, children }: SettingsSectionProps) => (
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <h2 className="font-medium text-base mb-4 text-zinc-900 dark:text-white">
            {title}
        </h2>
        {children}
    </section>
);
