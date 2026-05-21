import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../../infrastructure/logs/logger.service';

@Injectable()
export class HttpRedirectMiddleware implements NestMiddleware {
  private readonly context = HttpRedirectMiddleware.name;

  constructor(private readonly logger: LoggerService) {}
  use(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === 'production') {
      const proto = req.headers['x-forwarded-proto'];
      if (proto !== 'https') {
        this.logger.logWarn(this.context, 'HTTP to HTTPS redirect', {
          method: req.method,
          path: req.url,
          host: req.headers.host,
          ip: req.ip,
        });
        return res.redirect(`https://${req.headers.host}${req.url}`);
      }
    }
    next();
  }
}
