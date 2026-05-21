import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggerService {
  constructor(private readonly logger: PinoLogger) {}

  log(context: string, message: string, data?: Record<string, any>) {
    this.logger.info({ context, ...data }, message);
  }

  logWarn(context: string, message: string, data?: Record<string, any>) {
    this.logger.warn({ context, ...data }, message);
  }

  logError(
    context: string,
    message: string,
    err: unknown,
    data?: Record<string, any>,
  ) {
    this.logger.error({ context, err, ...data }, message);
  }
}
