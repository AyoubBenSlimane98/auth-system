import { SetMetadata } from '@nestjs/common';
import { RateLimitOptions } from '../interfaces';

export const RATELIMIT = 'RATE_LIMIT';

export const RateLimit = (options?: number | RateLimitOptions) =>
  SetMetadata(
    RATELIMIT,
    options == null
      ? { limit: 5, ttl: 60 }
      : typeof options === 'number'
        ? { limit: options, ttl: 60 }
        : options,
  );
