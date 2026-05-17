import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from './constants';
import { EmailProcessor } from './processors/notifications/email.processor';
import { SendGridService } from './processors/notifications/sendgrid.service';
import { REDIS } from '../redis/constants';
import Redis from 'ioredis';
import { PinoLogger } from 'nestjs-pino';
import { LoggerService } from '../logs/logger.service';

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
