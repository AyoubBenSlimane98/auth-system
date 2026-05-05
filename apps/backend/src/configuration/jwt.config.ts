import { registerAs } from '@nestjs/config';
import * as fs from 'fs';
import { join } from 'path';

export const jwtConfig = registerAs('jwt', () => {
  const fromRoot = (...paths: string[]) =>
    join(process.cwd(), '../../', ...paths);
  const read = (secretName: string, localPath: string) => {
    const dockerPath = `/run/secrets/${secretName}`;
    if (fs.existsSync(dockerPath)) {
      return fs.readFileSync(dockerPath, 'utf8');
    }
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath, 'utf8');
    }
    throw new Error(`Missing key: ${secretName}`);
  };
  return {
    auth: {
      privateKey: read(
        'auth_jwt_private_key',
        fromRoot('secrets/auth/private.key'),
      ),
      publicKey: read(
        'auth_jwt_public_key',
        fromRoot('secrets/auth/public.key'),
      ),
      access_token_ttl: process.env.ACCESS_TOKEN_EXPIRES_IN,
      refresh_token_ttl: process.env.REFRESH_TOKEN_EXPIRES_IN,
    },

    email: {
      privateKey: read(
        'email_jwt_private_key',
        fromRoot('secrets/email/private.key'),
      ),
      publicKey: read(
        'email_jwt_public_key',
        fromRoot('secrets/email/public.key'),
      ),
      expiresIn: process.env.EMAIL_TOKEN_EXPIRES_IN,
    },

    reset: {
      privateKey: read(
        'reset_jwt_private_key',
        fromRoot('secrets/reset/private.key'),
      ),
      publicKey: read(
        'reset_jwt_public_key',
        fromRoot('secrets/reset/public.key'),
      ),
      expiresIn: process.env.RESET_TOKEN_EXPIRES_IN,
    },
  };
});
