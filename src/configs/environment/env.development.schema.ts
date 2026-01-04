import * as joi from 'joi';

export const envDevSchema = joi.object({
  NODE_ENV: joi
    .string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: joi.number().port().default(3000),

  POSTGRES_USER: joi.string().required(),
  POSTGRES_PASSWORD: joi.string().required(),
  POSTGRES_PORT: joi.number().port().default(5432),
  POSTGRES_DB: joi.string().required(),

  DATABASE_URL: joi.string().uri().required(),

  ARGON_SECRET: joi.string().min(32).required(),

  JWT_PRIVATE_KEY: joi.string().required(),
  JWT_PUBLIC_KEY: joi.string().required(),

  GOOGLE_CLIENT_ID: joi.string().optional(),
  GOOGLE_CLIENT_SECRET: joi.string().optional(),
  GOOGLE_CALLBACK_URL: joi.string().uri().optional(),

  SENDGRID_API_KEY: joi.string().optional(),
  SENDGRID_FROM_EMAIL: joi.string().email().optional(),
  CORS_ORIGIN: joi.string().optional(),
  FRONTEND_URL: joi.string().uri(),

  REDIS_HOST: joi.string().required(),
  REDIS_PORT: joi.number().required().default(6379),
  REDIS_PASSWORD: joi.string().required(),
});
