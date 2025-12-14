import React from 'react';

export interface AvatarProps {
    src: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    status?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ src, size = 'md', status }) => {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
    };

    return (
        <div className="relative inline-block shrink-0">
            <img
                src={src}
                alt="Avatar"
                className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-zinc-900 bg-zinc-200 dark:bg-zinc-800`}
            />
            {status && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full box-content"></span>
            )}
        </div>
    );
};
