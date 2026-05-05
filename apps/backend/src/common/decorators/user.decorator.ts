import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtAuthPayload } from '../types';
import type { Request } from 'express';

export const User = createParamDecorator(
  (data: keyof JwtAuthPayload, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: JwtAuthPayload }>();
    const user = request.user;
    return data ? user[data] : user;
  },
);
