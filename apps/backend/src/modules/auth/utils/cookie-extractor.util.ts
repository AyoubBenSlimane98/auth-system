import type { Request } from 'express';
import { JwtCookies } from '../../../common/types';

export const cookieExtractor = (req: Request): string | null => {
  if (!req?.cookies) return null;
  return (req.cookies as JwtCookies).access_token ?? null;
};
