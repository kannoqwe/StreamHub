export const UserKeys = {
    TTL: 60 * 60,

    data: (userId: number) => `user:data:${userId}`,
    usernameIndex: (username: string) => `user:index:username:${username}`,
    streamKeyIndex: (streamKey: string) => `user:streamKey:${streamKey}`,
};

export const StreamKeys = {
    TTL_PAGE: 30,

    channelPage: (username: string) => `stream:page:${username}`,
};

export const ChatKeys = {
    last100: (streamerId: number) => `chat:streamer:${streamerId}:last100`,
};
