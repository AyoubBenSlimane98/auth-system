import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class GlobalRateLimitMiddleware implements NestMiddleware {
  private maxRequests = 100;
  private windowSec = 60;
  constructor(private readonly redisService: RedisService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip?.replace(/::ffff:/, '');
    const key = `rate_limit:${ip}`;

    const count = await this.redisService.rateLimitAtomic(
      key,
      this.maxRequests,
      this.windowSec,
    );
    if (count === -1) {
      throw new HttpException(
        { message: 'Too many requests' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    next();
  }
}
