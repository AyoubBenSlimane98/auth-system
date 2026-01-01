import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PERMISSIONS_KEY } from '../decorators';
import { Permission } from '../interfaces';
import { Request } from 'express';
import { JwtPayload } from 'src/modules/auth/interfaces';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<Permission>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermission) {
      return true;
    }
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();

    const userPermissions = request.user.permissions || [];
    const permissionString = `${requiredPermission.resource}.${requiredPermission.action}`;

    return userPermissions.includes(permissionString);
  }
}
