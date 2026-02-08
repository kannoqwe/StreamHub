export interface ProfileFormValues {
    username: string;
    displayName: string;
    bio: string;
}

export type UpdateProfilePayload = ProfileFormValues;

export interface UpdateProfileResult {
    profile: ProfileFormValues;
}

export type CopyButtonFeedback = 'success' | 'error' | null;
