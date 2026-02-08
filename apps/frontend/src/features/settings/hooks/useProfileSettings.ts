import { useAuthStore } from '../../../stores/useAuthStore';
import { useProfileAvatar } from './useProfileAvatar';
import { useProfileForm } from './useProfileForm';
import { useStreamKey } from './useStreamKey';

export const useProfileSettings = () => {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);

    const profileForm = useProfileForm({ user, setUser });
    const profileAvatar = useProfileAvatar(user);
    const streamKey = useStreamKey({ enabled: !!user });

    return {
        user,
        ...profileForm,
        ...profileAvatar,
        ...streamKey,
    };
};
