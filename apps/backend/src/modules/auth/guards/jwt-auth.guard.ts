import { AuthGuard } from '@nestjs/passport';
import { STRATEGIES } from '../strategies';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../../../common/decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard(STRATEGIES.JWT_AUTH) {
  constructor(private readonly reflector: Reflector) {
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
}
