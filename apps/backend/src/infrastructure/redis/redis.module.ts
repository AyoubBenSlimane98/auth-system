import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisType } from '../../configuration/types';
import { REDIS } from './constants';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';
        const client = isProd
          ? new Redis(config.getOrThrow<string>('REDIS_URL'), {
              maxRetriesPerRequest: null,
              enableReadyCheck: false,
            })
          : new Redis({
              ...config.getOrThrow<RedisType>('redis'),
              maxRetriesPerRequest: null,
              enableReadyCheck: true,
            });
        client.on('connect', () => {
          console.log('[Redis] connected');
        });

        client.on('error', (err) => {
          console.error('[Redis] error:', err);
        });

        return client;
      },
    },
    RedisService,
  ],
  exports: [REDIS, RedisService],
})
export class RedisModule {}
