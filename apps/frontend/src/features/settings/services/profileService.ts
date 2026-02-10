import { $api } from '@api';
import { StreamKeyResponse, UserModel } from '@streamhub/shared';
import { UpdateProfilePayload, UpdateProfileResult } from '../types/profileSettings.types';

export const ProfileService = {
    async updateProfile(
        payload: UpdateProfilePayload,
    ): Promise<UpdateProfileResult> {
        const { data } = await $api.post<UserModel>('/user/profile', payload);
        return {
            profile: {
                username: data.username,
                displayName: data.displayName,
                bio: data.bio ?? '',
            },
        };
    },

    async getStreamKey(): Promise<StreamKeyResponse> {
        const { data } = await $api.get<StreamKeyResponse>('/stream/key');
        return data;
    },

    async resetStreamKey(): Promise<StreamKeyResponse> {
        const { data } = await $api.post<StreamKeyResponse>(
            '/stream/generate_key',
        );
        return data;
    },
};
