import { registerAs } from '@nestjs/config';
import * as fs from 'fs';
import { join } from 'path';

export const jwtConfig = registerAs('jwt', () => {
  const fromRoot = (...paths: string[]) =>
    join(process.cwd(), '../../', ...paths);

  const read = (localPath: string) => {
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath, 'utf8');
    }

    throw new Error(`Missing key: ${localPath}`);
  };

  return {
    auth: {
      privateKey: read(fromRoot('secrets/auth/private.pem')),
      publicKey: read(fromRoot('secrets/auth/public.pem')),
    },
    email: {
      privateKey: read(fromRoot('secrets/email/private.pem')),
      publicKey: read(fromRoot('secrets/email/public.pem')),
    },
    reset: {
      privateKey: read(fromRoot('secrets/reset/private.pem')),
      publicKey: read(fromRoot('secrets/reset/public.pem')),
    },
  };
});
