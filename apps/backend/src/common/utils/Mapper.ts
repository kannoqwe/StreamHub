import { User } from '@generated/client';
import { UserProfile } from '@streamhub/shared';

export class Mapper {
    static mapToUserProfile(user: User): UserProfile {
        return {
            id: user.id,
            username: user.username,
            displayName: user.username,
            avatar: 'https://www.shutterstock.com/image-vector/clown-face-red-nose-isolated-600nw-2678196061.jpg',
            bio: 'qwe',
            followers: 0,
            isOnline: false,
        };
    }
}
