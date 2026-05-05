import type { Response } from 'express';
import { JwtCookies } from '../../../common/types';

export class CookieUtil {
  static setAuthCookies(res: Response, tokens: JwtCookies) {
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('session_id', tokens.session_id, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
  static clearAuthCookies(res: Response) {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none' as const,
      path: '/',
    };
    res.clearCookie('access_token', options);
    res.clearCookie('refresh_token', options);
    res.clearCookie('session_id', options);
  }
}
