import { JwtPayloadTypes } from '../enums';
import { BaseJwtPayload } from './base-jwt-payload.type';

export type JwtResetPayload = BaseJwtPayload & {
  type: JwtPayloadTypes.RESET_PASSWORD;
};
