import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { User } from '@types';
import { ProfileService } from '../services/profileService';
import { ProfileFormValues } from '../types/profileSettings.types';
import { extractSettingsErrorMessage } from '../utils/error';

interface UseProfileFormParams {
    user: User | null;
    setUser: (user: User | null) => void;
}

const createInitialValues = (user: User | null): ProfileFormValues => ({
    username: user?.username ?? '',
    displayName: user?.displayName ?? '',
    bio: user?.bio ?? '',
});

export const useProfileForm = ({
    user,
    setUser,
}: UseProfileFormParams) => {
    const initialValues = useMemo(() => createInitialValues(user), [user]);
    const [savedValues, setSavedValues] =
        useState<ProfileFormValues>(initialValues);
    const [formData, setFormData] = useState<ProfileFormValues>(initialValues);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const nextValues = createInitialValues(user);
        setFormData(nextValues);
        setSavedValues(nextValues);
        setSaveError(null);
    }, [user]);

    const isDirty =
        formData.username !== savedValues.username ||
        formData.displayName !== savedValues.displayName ||
        formData.bio !== savedValues.bio;

    const updateField =
        (field: keyof ProfileFormValues) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            setFormData((current) => ({
                ...current,
                [field]: event.target.value,
            }));
            setSaveError(null);
        };

    const handleSave = async (event: FormEvent) => {
        event.preventDefault();
        if (!user || !isDirty || isSaving) return;

        setIsSaving(true);
        setSaveError(null);
        try {
            const { profile } = await ProfileService.updateProfile(formData);
            setFormData(profile);
            setSavedValues(profile);
            setUser({
                ...user,
                ...profile,
            });
        } catch (error: unknown) {
            setSaveError(
                extractSettingsErrorMessage(error, 'Unable to save profile changes'),
            );
        } finally {
            setIsSaving(false);
        }
    };

    return {
        formData,
        isDirty,
        isSaving,
        saveError,
        updateField,
        handleSave,
    };
};
