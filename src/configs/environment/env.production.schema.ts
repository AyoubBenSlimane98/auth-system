import * as joi from 'joi';

export const envProdSchema = joi.object({
  NODE_ENV: joi.string().valid('production').required(),

  PORT: joi.number().port().required(),

  POSTGRES_USER: joi.string().required(),
  POSTGRES_PASSWORD: joi.string().required(),
  POSTGRES_PORT: joi.number().port().default(5432),
  POSTGRES_DB: joi.string().required(),

  DATABASE_URL: joi.string().uri().required(),

  ARGON_SECRET: joi.string().min(32).required(),

  JWT_PRIVATE_KEY: joi.string().required(),
  JWT_PUBLIC_KEY: joi.string().required(),

  GOOGLE_CLIENT_ID: joi.string().required(),
  GOOGLE_CLIENT_SECRET: joi.string().required(),
  GOOGLE_CALLBACK_URL: joi.string().uri().required(),

  SENDGRID_API_KEY: joi.string().required(),
  SENDGRID_FROM_EMAIL: joi.string().email().required(),
});
