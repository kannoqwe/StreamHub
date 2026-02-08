import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { User } from '@types';
import { readFileAsDataUrl } from '../utils/file';

export const useProfileAvatar = (user: User | null) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [avatarPreviewOverride, setAvatarPreviewOverride] = useState<
        string | null
    >(null);
    const avatarPreview = useMemo(
        () => avatarPreviewOverride ?? user?.avatar ?? '',
        [avatarPreviewOverride, user?.avatar],
    );

    const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        try {
            const preview = await readFileAsDataUrl(file);
            setAvatarPreviewOverride(preview);
        } catch {
            return;
        }
    };

    const handleAvatarDelete = () => {
        setAvatarPreviewOverride('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return {
        fileInputRef,
        avatarPreview,
        handleAvatarChange,
        handleAvatarDelete,
        openAvatarPicker: () => fileInputRef.current?.click(),
    };
};
