import * as Joi from 'joi';

export const validationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),

    PORT: Joi.number().default(3000),

    DATABASE_URL: Joi.string().required(),

    JWT_ACCESS_SECRET: Joi.string().min(16).required(),
    JWT_REFRESH_SECRET: Joi.string().min(16).required(),

    NATS_URL: Joi.string().uri().required(),

    FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),

    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().default(6379),

    SCYLLA_CONTACT_POINTS: Joi.string().required(),
    SCYLLA_PORT: Joi.number().default(9042),
    SCYLLA_DATACENTER: Joi.string().default('datacenter1'),
    SCYLLA_KEYSPACE: Joi.string().default('streamplatform'),
});
