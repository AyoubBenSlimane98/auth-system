import * as argon2 from 'argon2';
export const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  timeCost: 3,
  memoryCost: 2 ** 16,
  parallelism: 1,
  hashLength: 32,
};

export const JWT_EXPIRES_IN = '15m';
