import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT = 'RATE_LIMIT';

export interface RateLimitOptions {
  limit: number;
  ttl: number;
}

export const RateLimit = (options: RateLimitOptions = { limit: 3, ttl: 60 }) =>
  SetMetadata(RATE_LIMIT, options);
