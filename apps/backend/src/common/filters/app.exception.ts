import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../enums';

type AppExceptionOptions<T = unknown> = {
  message: string;
  statusCode?: HttpStatus;
  code?: ErrorCode;
  data?: T;
};

export class AppException extends HttpException {
  constructor({
    message,
    statusCode = HttpStatus.BAD_REQUEST,
    code = ErrorCode.APP_ERROR,
    data = null,
  }: AppExceptionOptions) {
    super(
      {
        message,
        code,
        data,
      },
      statusCode,
    );
  }
}
