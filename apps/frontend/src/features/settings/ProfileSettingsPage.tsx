import { Navigate } from 'react-router-dom';
import { ProfilePictureSection } from './components/ProfilePictureSection';
import { ProfileSettingsSection } from './components/ProfileSettingsSection';
import { StreamKeySection } from './components/StreamKeySection';
import { useProfileSettings } from './hooks/useProfileSettings';

export const ProfileSettingsPage = () => {
    const {
        user,
        formData,
        avatarPreview,
        streamKey,
        showStreamKey,
        copyButtonFeedback,
        isDirty,
        isSaving,
        saveError,
        isStreamKeyLoading,
        isResettingKey,
        fileInputRef,
        updateField,
        handleSave,
        handleAvatarChange,
        handleAvatarDelete,
        handleCopyStreamKey,
        handleStreamKeyReset,
        toggleStreamKeyVisibility,
        openAvatarPicker,
    } = useProfileSettings();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto w-full space-y-5">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                    Settings
                </h1>
            </header>

            <ProfilePictureSection
                avatarPreview={avatarPreview}
                fileInputRef={fileInputRef}
                onAvatarChange={handleAvatarChange}
                onAvatarDelete={handleAvatarDelete}
                onAvatarEditClick={openAvatarPicker}
            />

            <ProfileSettingsSection
                formData={formData}
                isDirty={isDirty}
                isSaving={isSaving}
                saveError={saveError}
                onSubmit={(event) => void handleSave(event)}
                onUsernameChange={updateField('username')}
                onDisplayNameChange={updateField('displayName')}
                onBioChange={updateField('bio')}
            />

            <StreamKeySection
                streamKey={streamKey}
                showStreamKey={showStreamKey}
                copyButtonFeedback={copyButtonFeedback}
                isStreamKeyLoading={isStreamKeyLoading}
                isResettingKey={isResettingKey}
                onToggleVisibility={toggleStreamKeyVisibility}
                onCopy={() => void handleCopyStreamKey()}
                onReset={() => void handleStreamKeyReset()}
            />
        </div>
    );
};
