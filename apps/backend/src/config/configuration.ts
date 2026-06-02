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

    scylla: {
        contactPoints: process.env.SCYLLA_CONTACT_POINTS,
        port: parseInt(process.env.SCYLLA_PORT || '9042', 10),
        localDatacenter: process.env.SCYLLA_DATACENTER || 'datacenter1',
        keyspace: process.env.SCYLLA_KEYSPACE || 'streamplatform',
    },

    ingest: {
        hookSecret: process.env.INGEST_HOOK_SECRET,
    },

    srs: {
        hlsBaseUrl: process.env.SRS_HLS_BASE_URL || 'http://srs:8080',
        hlsPath: process.env.SRS_HLS_PATH || '/live',
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
        allowedOrigins: (
            process.env.FRONTEND_ALLOWED_ORIGINS ||
            process.env.FRONTEND_URL ||
            'http://localhost:5173'
        )
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
    },
});
