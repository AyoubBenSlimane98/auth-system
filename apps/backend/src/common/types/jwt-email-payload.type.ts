import { JwtPayloadTypes } from '../enums';
import { BaseJwtPayload } from './base-jwt-payload.type';

export type JwtEmailPayload = BaseJwtPayload & {
  type: JwtPayloadTypes.VERIFY_EMAIL;
};
