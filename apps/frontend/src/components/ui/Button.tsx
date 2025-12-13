import React from 'react';

export interface ButtonProps {
    children?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'outline';
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
    icon?: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    className = '',
    onClick,
    icon,
    type = 'button',
    disabled,
}) => {
    const baseStyle =
        'px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm';

    const variants = {
        primary: 'bg-accent-500 hover:bg-accent-600 text-white',
        secondary:
            'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white',
        ghost: 'hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300',
        glass: 'glass bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 hover:bg-white/70 dark:hover:bg-zinc-800/70 text-zinc-900 dark:text-white',
        outline:
            'border border-zinc-300 dark:border-zinc-700 hover:border-accent-500 hover:text-accent-500 text-zinc-600 dark:text-zinc-300',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {icon && <span className="w-4 h-4">{icon}</span>}
            {children}
        </button>
    );
};
