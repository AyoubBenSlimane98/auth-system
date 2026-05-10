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
        const redis = config.getOrThrow<RedisType>('redis');
        const isProd = config.get<string>('NODE_ENV') === 'production';

        const client = new Redis({
          host: redis.host,
          port: redis.port,
          password: isProd ? redis.password : undefined,

          maxRetriesPerRequest: null,
          enableReadyCheck: true,
          lazyConnect: false,
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
