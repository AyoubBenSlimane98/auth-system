import { JwtPayloadTypes } from '../enums';
import { BaseJwtPayload } from './base-jwt-payload.type';

export type JwtAuthPayload = BaseJwtPayload & {
  session_id: string;
  type: JwtPayloadTypes.ACCESS;
};
