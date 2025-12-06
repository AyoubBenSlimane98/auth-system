import { registerAs } from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export default registerAs('jwt-key', () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      privateKey: process.env.JWT_PRIVATE_KEY!,
      publicKey: process.env.JWT_PUBLIC_KEY!,
    };
  }
  const keysPath = join(__dirname, '../../keys');
  if (
    !existsSync(join(keysPath, 'private.pem')) ||
    !existsSync(join(keysPath, 'public.pem'))
  ) {
    throw new Error('Keys no found in ' + keysPath);
  }

  return {
    privateKey: readFileSync(join(keysPath, 'private.pem'), 'utf-8'),
    publicKey: readFileSync(join(keysPath, 'public.pem'), 'utf-8'),
  };
});
