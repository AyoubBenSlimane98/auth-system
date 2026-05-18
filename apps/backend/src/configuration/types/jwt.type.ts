export type TimeString = `${number}${'s' | 'm' | 'h' | 'd'}`;
export interface JwtType {
  auth: {
    publicKey: string;
    privateKey: string;
    access_token_ttl: TimeString;
    refresh_token_ttl: TimeString;
  };

  email: {
    publicKey: string;
    privateKey: string;
    expiresIn: TimeString;
  };

  reset: {
    publicKey: string;
    privateKey: string;
    expiresIn: TimeString;
  };
}
