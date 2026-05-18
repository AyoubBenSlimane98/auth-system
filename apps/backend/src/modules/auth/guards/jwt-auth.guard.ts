import { AuthGuard } from '@nestjs/passport';
import { STRATEGIES } from '../strategies';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../../../common/decorators';
import { LoggerService } from '../../../infrastructure/logs/logger.service';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard(STRATEGIES.JWT_AUTH) {
  private readonly context = JwtAuthGuard.name;
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: LoggerService,
  ) {
    super();
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    const req = context.switchToHttp().getRequest<Request>();
    if (err || !user) {
      this.logger.logWarn(this.context, 'jwt authentication failed', {
        path: req.url,
        ip: req.ip,
        error: info?.message,
      });

      throw err || new UnauthorizedException();
    }

    return user;
  }
}
