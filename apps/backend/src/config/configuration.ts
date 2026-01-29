export default () => ({
    port: parseInt(process.env.PORT!, 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    database: {
        url: process.env.DATABASE_URL,
    },

    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT!),
    },

    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExpiration: '15m',
        refreshExpiration: '14d',
    },

    nats: {
        url: process.env.NATS_URL,
        ingestSubject: 'chat.ingest',
        queueGroup: 'chat-worker',
        ingestStream: 'CHAT_INGEST',
        broadcastPrefix: 'chat.broadcast',
    },

    cookies: {
        refreshToken: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
            path: '/auth/refresh',
        },
    },

    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:5173',
    },
});
