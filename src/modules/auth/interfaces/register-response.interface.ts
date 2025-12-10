export interface Token {
  token_id: string;
  access_token: string;
  refresh_token: string;
}
export interface RegisterResponse {
  user: {
    user_id: string;
    full_name: string;
  };
  tokens: Token;
}
