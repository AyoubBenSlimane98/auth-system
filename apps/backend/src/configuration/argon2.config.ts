import { registerAs } from '@nestjs/config';

export const argon2Config = registerAs('argon2', () => ({
  secret: process.env.ARGON2_SECRET,
}));
