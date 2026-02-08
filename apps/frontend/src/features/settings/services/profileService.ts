import { $api } from '@api';
import { StreamKeyResponse } from '@streamhub/shared';
import { UpdateProfilePayload, UpdateProfileResult } from '../types/profileSettings.types';

const wait = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

export const ProfileService = {
    async updateProfile(
        payload: UpdateProfilePayload,
    ): Promise<UpdateProfileResult> {
        // TODO: replace with backend call when profile endpoint is ready.
        await wait(180);
        return { profile: { ...payload } };
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
