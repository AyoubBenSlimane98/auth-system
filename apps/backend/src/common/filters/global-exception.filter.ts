import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '../enums';


function isErrorCode(value: unknown): value is ErrorCode {
  return Object.values(ErrorCode).includes(value as ErrorCode);
}
export interface ValidationErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (response.headersSent) {
      return;
    }
    if (exception instanceof HttpException) {
      const res = exception.getResponse() as ValidationErrorResponse;
      if (res.errors) {
        const responseBody: any = {
          status: false,
          message: res.message,
          code: ErrorCode.VALIDATION_ERROR,
          data: {
            errors: res.errors,
          },
          meta: {
            method: request.method,
            path: request.url,
            timestamp: new Date().toISOString(),
          },
        };
        return response.status(HttpStatus.BAD_REQUEST).json(responseBody);
      }
    }

    const isHttpException = exception instanceof HttpException;

    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    let message = 'Internal server error';
    let code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    let data: unknown = null;

    if (
      isHttpException &&
      exceptionResponse &&
      typeof exceptionResponse === 'object'
    ) {
      const res = exceptionResponse as Record<string, unknown>;

      if (Array.isArray(res.message)) {
        message = res.message.filter(Boolean).join(', ');
      } else if (typeof res.message === 'string') {
        message = res.message;
      }

      if (isErrorCode(res.code)) {
        code = res.code;
      }

      data = res.data ?? null;
    }

    if (!isHttpException) {
      message = (exception as Error)?.message || message;
    }

    const responseBody: any = {
      status: false,
      message,
      code,
      data,
      meta: {
        method: request.method,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(statusCode).json(responseBody);
  }
}
