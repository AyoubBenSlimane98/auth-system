export interface JwtPayload {
  sub: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}
