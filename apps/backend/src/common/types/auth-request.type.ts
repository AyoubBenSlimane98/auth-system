import type { Request } from 'express';
import { JwtCookies } from './jwt-cookies.type';

export type AuthRequest = Request & {
  cookies: JwtCookies;
};
