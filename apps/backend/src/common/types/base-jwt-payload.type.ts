export type BaseJwtPayload = {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
};
