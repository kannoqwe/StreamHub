import { ChangeEvent, FormEvent } from 'react';
import { LuSave, LuUser, LuUserRoundPen } from 'react-icons/lu';
import { Button, Input } from '@components/ui';
import { ProfileFormValues } from '../types/profileSettings.types';
import { SettingsSection } from './SettingsSection';

interface ProfileSettingsSectionProps {
    formData: ProfileFormValues;
    isDirty: boolean;
    isSaving: boolean;
    onSubmit: (event: FormEvent) => void;
    onUsernameChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onDisplayNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onBioChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileSettingsSection = ({
    formData,
    isDirty,
    isSaving,
    onSubmit,
    onUsernameChange,
    onDisplayNameChange,
    onBioChange,
}: ProfileSettingsSectionProps) => (
    <SettingsSection title="Profile Settings">
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Username
                </label>
                <Input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={onUsernameChange}
                    icon={<LuUser className="w-4 h-4" />}
                    required
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Display Name
                </label>
                <Input
                    type="text"
                    placeholder="Display name"
                    value={formData.displayName}
                    onChange={onDisplayNameChange}
                    icon={<LuUserRoundPen className="w-4 h-4" />}
                    required
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Bio
                </label>
                <Input
                    type="text"
                    placeholder="Tell something about yourself"
                    value={formData.bio}
                    onChange={onBioChange}
                    icon={<LuUserRoundPen className="w-4 h-4" />}
                />
            </div>

            <Button
                type="submit"
                className="w-full sm:w-auto"
                icon={<LuSave className="w-4 h-4" />}
                disabled={!isDirty || isSaving}
            >
                {isSaving ? 'Saving...' : 'Save'}
            </Button>
        </form>
    </SettingsSection>
);
