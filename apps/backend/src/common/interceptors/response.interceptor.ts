import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    return next.handle().pipe(
      map((data: { message: string; data: unknown }) => ({
        status: true,
        message: data.message,
        data: data.data,
        meta: {
          method: request.method,
          path: request.url,
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
