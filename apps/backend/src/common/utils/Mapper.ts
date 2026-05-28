import { StreamSession, User } from '@generated/client';
import type { UserModel, StreamModel } from '@streamhub/shared';
import { dateToTimestamp } from '@common/utils/time';

export class Mapper {
    static mapToUserProfile(user: User): UserModel {
        return {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatarUrl,
            bio: user.bio,
            followers: user.followersCount,
            isOnline: false,
        };
    }

    static mapToStream(stream: StreamSession, streamer: User): StreamModel {
        void streamer;

        return {
            id: stream.id,
            title: stream.title,
            streamerId: stream.streamerId,
            thumbnail: stream.thumbnail,
            category: stream.categoryId,
            playbackId: String(stream.id),
            viewerCount: 0,
            startedAt: dateToTimestamp(stream.startedAt),
        };
    }
}
