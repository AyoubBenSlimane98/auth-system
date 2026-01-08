import { SetMetadata } from '@nestjs/common';
import { Permission } from '../interfaces';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (permission: Permission) =>
  SetMetadata(PERMISSIONS_KEY, permission);
