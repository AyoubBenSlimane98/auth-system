import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { EMAIL_QUEUE } from './constants';
import { RedisType } from '../../configuration/types';
import { EmailProcessor } from './processors/notifications/email.processor';
import { SendGridService } from './processors/notifications/sendgrid.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const queue = config.getOrThrow<RedisType>('queue');
        const isProd = config.get<string>('NODE_ENV') === 'production';

        return {
          connection: {
            host: queue.host,
            port: queue.port,
            password: isProd ? queue.password : undefined,

            maxRetriesPerRequest: null,
            enableReadyCheck: true,
            lazyConnect: false,
          },
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
