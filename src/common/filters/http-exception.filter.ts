import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let error: string = 'InternalServerError';
    let message: string | string[] = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as
        | string
        | { message?: string | string[]; error?: string };

      if (typeof res === 'string') {
        message = res;
        error = exception.name;
      } else {
        message = res.message || 'Unknown error';
        error = res.error || exception.name;
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      (exception as Error).message &&
      Array.isArray((exception as Error).message)
    ) {
      status = HttpStatus.BAD_REQUEST;
      message = (exception as Error).message;
      error = 'ValidationError';
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    response.status(status).json({
      success: false,
      error,
      message,
    });
  }
}
