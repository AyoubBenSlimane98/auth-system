import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpRedirectMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === 'production') {
      const proto = req.headers['x-forwarded-proto'];
      if (proto !== 'https') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
      }
    }
    next();
  }
}
