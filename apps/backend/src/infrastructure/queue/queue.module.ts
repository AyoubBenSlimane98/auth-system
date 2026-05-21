import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from './constants';
import {
  EmailProcessor,
  SendGridService,
} from '@infrastructure/queue/processors/notifications';
import { REDIS } from '@infrastructure/redis/constants';
import Redis from 'ioredis';
import { LoggerService } from '@infrastructure/logs/logger.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [REDIS, LoggerService],
      useFactory: (redis: Redis, logger: LoggerService) => {
        logger.log('QueueModule', 'initializing BullMQ');
        return {
          connection: redis,
        };
      },
    }),

    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
  ],
  providers: [EmailProcessor, SendGridService],
  exports: [BullModule],
})
export class QueueModule {}
