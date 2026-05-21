import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisType } from '@configuration/types';
import { REDIS } from '@infrastructure/redis/constants';
import { RedisService } from '@infrastructure/redis/redis.service';
import { LoggerService } from '@infrastructure/logs/logger.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService, LoggerService],
      useFactory: (config: ConfigService, logger: LoggerService) => {
        const isProd =
          config.getOrThrow<'production' | 'development'>('NODE_ENV') ===
          'production';
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

        const context = RedisModule.name;

        client.on('connect', () => {
          logger.log(context, 'connected');
        });

        client.on('ready', () => {
          logger.log(context, 'ready to accept commands');
        });

        if (isProd) {
          client.on('reconnecting', () => {
            logger.logWarn(context, 'reconnecting...');
          });
        }

        client.on('error', (err) => {
          logger.logError(context, 'Redis connection error', err);
        });

        client.on('end', () => {
          logger.logWarn(context, 'connection closed');
        });

        return client;
      },
    },
    RedisService,
  ],
  exports: [REDIS, RedisService],
})
export class RedisModule {}
