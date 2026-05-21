import { registerAs } from '@nestjs/config';
import * as fs from 'fs';
import { join } from 'path';

const isProd = process.env.NODE_ENV === 'production';

const fromRoot = (...paths: string[]) =>
  join(process.cwd(), '../../', ...paths);

const readFile = (path: string) => {
  if (!fs.existsSync(path)) {
    throw new Error(`Missing key file: ${path}`);
  }
  return fs.readFileSync(path, 'utf8');
};

const getKey = (envKey: string, filePath: string) => {
  if (isProd) {
    const value = process.env[envKey];
    if (!value) throw new Error(`Missing env key: ${envKey}`);
    return value.replace(/\\n/g, '\n');
  }

  return readFile(fromRoot(filePath));
};

export const jwtConfig = registerAs('jwt', () => {
  return {
    auth: {
      privateKey: getKey('JWT_AUTH_PRIVATE_KEY', 'secrets/auth/private.pem'),
      publicKey: getKey('JWT_AUTH_PUBLIC_KEY', 'secrets/auth/public.pem'),
      access_token_ttl: process.env.ACCESS_TOKEN_EXPIRES_IN,
      refresh_token_ttl: process.env.REFRESH_TOKEN_EXPIRES_IN,
    },

    email: {
      privateKey: getKey('JWT_EMAIL_PRIVATE_KEY', 'secrets/email/private.pem'),
      publicKey: getKey('JWT_EMAIL_PUBLIC_KEY', 'secrets/email/public.pem'),
      expiresIn: process.env.EMAIL_TOKEN_EXPIRES_IN,
    },

    reset: {
      privateKey: getKey('JWT_RESET_PRIVATE_KEY', 'secrets/reset/private.pem'),
      publicKey: getKey('JWT_RESET_PUBLIC_KEY', 'secrets/reset/public.pem'),
      expiresIn: process.env.RESET_TOKEN_EXPIRES_IN,
    },
  };
});
