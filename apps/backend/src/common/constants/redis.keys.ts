export const UserKeys = {
    data: (userId: number) => `user:data:${userId}`,
    usernameIndex: (username: string) => `user:index:username:${username}`,
};
