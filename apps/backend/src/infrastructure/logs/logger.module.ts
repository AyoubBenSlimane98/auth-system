import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IncomingMessage, ServerResponse } from 'http';
import { randomUUID } from 'crypto';
import { LoggerModule as LogModule } from 'nestjs-pino';
import { LoggerService } from '@infrastructure/logs/logger.service';

@Global()
@Module({
  imports: [
    LogModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd =
          config.getOrThrow<'production' | 'development'>('NODE_ENV') ===
          'production';

        return {
          pinoHttp: {
            level: isProd ? 'info' : 'debug',

            genReqId: (req) =>
              (req.headers['x-request-id'] as string) || randomUUID(),

            transport: !isProd
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                }
              : undefined,

            serializers: {
              req(req: IncomingMessage) {
                return {
                  method: req.method,
                  url: req.url,
                  headers: {
                    'user-agent': req.headers['user-agent'],
                    'x-request-id': req.headers['x-request-id'],
                  },
                };
              },
              res(res: ServerResponse) {
                return {
                  statusCode: res.statusCode,
                };
              },
            },

            autoLogging: {
              ignore: (req: IncomingMessage) =>
                req.url?.startsWith('/health') === true,
            },

            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'password',
                'accessToken',
                'refreshToken',
              ],
              censor: '[REDACTED]',
            },
          },
        };
      },
    }),
  ],
  providers: [LoggerService],
  exports: [LogModule, LoggerService],
})
export class LoggerModule {}
