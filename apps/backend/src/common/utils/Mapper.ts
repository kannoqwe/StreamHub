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

    static mapToStream(stream: StreamSession, streamer: User): StreamModel {
        return {
            id: stream.id,
            title: stream.title,
            category: stream.categoryId,
            key: streamer.streamKey,
            viewerCount: 0,
            streamer: this.mapToUserProfile(streamer),
            thumbnail: stream.thumbnail,
            startedAt: dateToTimestamp(stream.startedAt),
        };
    }
}
