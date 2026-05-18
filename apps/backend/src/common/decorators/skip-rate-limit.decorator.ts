import { SetMetadata } from '@nestjs/common';
export const SKIP_RATE_LIMIT = 'SKIP_RATE_LIMIT';
export const SkipRateLimit = () => SetMetadata(SKIP_RATE_LIMIT, true);
