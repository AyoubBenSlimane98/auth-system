import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { RATELIMIT } from '../decorators';
import { RateLimitOptions } from '../interfaces';

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly defaultOptions: RateLimitOptions = { limit: 5, ttl: 60 };
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const ip = req.ip?.replace(/::ffff:/, '');

    const route = `${req.method}:${req.originalUrl.split('?')[0]}`;

    const key = `rate_limit:auth:${ip}:${route}`;
    console.log({ ip, route });
    const options =
      this.reflector.getAllAndOverride<RateLimitOptions>(RATELIMIT, [
        context.getHandler(),
        context.getClass(),
      ]) ?? this.defaultOptions;
    const { limit, ttl } = options;
    const count = await this.redisService.rateLimitAtomic(key, limit, ttl);

    if (count === -1) {
      throw new HttpException(
        { message: 'Too many authentication attempts' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
