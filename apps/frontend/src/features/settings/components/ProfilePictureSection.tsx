import { ChangeEvent, RefObject } from 'react';
import { LuImagePlus, LuTrash2 } from 'react-icons/lu';
import { Avatar, Button } from '@components/ui';
import { SettingsSection } from './SettingsSection';

interface ProfilePictureSectionProps {
    avatarPreview: string;
    fileInputRef: RefObject<HTMLInputElement | null>;
    onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onAvatarDelete: () => void;
    onAvatarEditClick: () => void;
}

export const ProfilePictureSection = ({
    avatarPreview,
    fileInputRef,
    onAvatarChange,
    onAvatarDelete,
    onAvatarEditClick,
}: ProfilePictureSectionProps) => (
    <SettingsSection title="Profile Picture">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {avatarPreview ? (
                <Avatar src={avatarPreview} size="xl" />
            ) : (
                <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700" />
            )}

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onAvatarChange}
            />

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={onAvatarEditClick}
                    icon={<LuImagePlus className="w-4 h-4" />}
                >
                    Edit
                </Button>
                <button
                    type="button"
                    onClick={onAvatarDelete}
                    className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-red-500 hover:border-red-500 transition-colors"
                    aria-label="Delete profile picture"
                    title="Delete profile picture"
                >
                    <LuTrash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    </SettingsSection>
);
