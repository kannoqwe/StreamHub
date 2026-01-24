export const UserKeys = {
    TTL: 60 * 60,

    data: (userId: number) => `user:data:${userId}`,
    usernameIndex: (username: string) => `user:index:username:${username}`,
    streamKeyIndex: (streamKey: string) => `user:streamKey:${streamKey}`,
};
