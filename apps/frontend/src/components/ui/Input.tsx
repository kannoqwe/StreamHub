import React from 'react';

export interface InputProps {
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon?: React.ReactNode;
    required?: boolean;
}

export const Input: React.FC<InputProps> = ({
    type,
    placeholder,
    value,
    onChange,
    icon,
    required,
}) => (
    <div className="relative group">
        <input
            type={type}
            required={required}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-sm"
        />
        <div className="absolute left-3 top-3 text-zinc-400 group-focus-within:text-accent-500 transition-colors">
            {icon}
        </div>
    </div>
);
