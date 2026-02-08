import { StreamSession, User } from '@generated/client';
import { UserModel, StreamModel } from '@streamhub/shared';
import { dateToTimestamp } from '@common/utils/time';

export class Mapper {
    static mapToUserProfile(user: User): UserModel {
        return {
            id: user.id,
            username: user.username,
            displayName: user.username,
            avatar: user.avatarUrl,
            bio: user.bio,
            followers: user.followersCount,
            isOnline: false,
        };
    }

    static mapToStream(
        stream: StreamSession,
        streamer: User,
        includePrivateKey = false,
    ): StreamModel {
        return {
            id: stream.id,
            title: stream.title,
            streamerId: streamer.id,
            thumbnail: stream.thumbnail,
            category: stream.categoryId,
            ...(includePrivateKey ? { key: streamer.streamKey } : {}),
            viewerCount: 0,
            startedAt: dateToTimestamp(stream.startedAt),
        };
    }
}
