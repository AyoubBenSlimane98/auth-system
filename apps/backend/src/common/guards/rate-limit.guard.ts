import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RATE_LIMIT, RateLimitOptions, SKIP_RATE_LIMIT } from '../decorators';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { AppException } from '../filters';
import { ErrorCode } from '../enums';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_RATE_LIMIT, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT,
      [context.getHandler(), context.getClass()],
    );

    if (!options) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const key = `rate_limit:${this.buildKey(request)}`;

    const current = await this.redisService.incr(key);

    if (current === 1) {
      await this.redisService.expire(key, options.ttl);
    }

    const ttl = await this.redisService.ttl(key);

    const remaining = Math.max(options.limit - current, 0);

    // attach metadata to request
    (request as any).rateLimit = {
      limit: options.limit,
      remaining,
      resetIn: ttl,
    };

    if (current > options.limit) {
      throw new AppException<{ limit: number; retryAfter: number }>({
        message: 'Too many requests',
        code: ErrorCode.TOO_MANY_REQUEST_EXCEPTION,
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        data: {
          limit: options.limit,
          retryAfter: ttl,
        },
      });
    }

    return true;
  }

  private buildKey(request: any): string {
    const userId = request.user?.id;

    const ipRaw =
      request.headers['x-forwarded-for'] ||
      request.ip ||
      request.socket?.remoteAddress ||
      'unknown';

    const ip = Array.isArray(ipRaw) ? ipRaw[0] : ipRaw.toString();

    const route = request.route?.path || request.path;

    return userId ? `user:${userId}:${route}` : `ip:${ip}:${route}`;
  }
}
