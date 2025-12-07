import { registerAs } from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export default registerAs('jwt-key', () => {
  const envPrivate = process.env.JWT_PRIVATE_KEY;
  const envPublic = process.env.JWT_PUBLIC_KEY;
  if (envPrivate && envPublic) {
    return { privateKey: envPrivate, publicKey: envPublic };
  }
  const keysPath = join(__dirname, '../../src/keys');
  const privateKeyPath = join(keysPath, 'private.pem');
  const publicKeyPath = join(keysPath, 'public.pem');
  if (!existsSync(privateKeyPath) || !existsSync(publicKeyPath)) {
    throw new Error('Keys not found in ' + keysPath);
  }

  return {
    privateKey: readFileSync(privateKeyPath, 'utf-8'),
    publicKey: readFileSync(publicKeyPath, 'utf-8'),
  };
});
