import { ApiResponse } from 'src/common/interfaces';

export interface Token {
  token_id: string;
  access_token: string;
  refresh_token: string;
}
export interface Register {
  user: {
    user_id: string;
    full_name: string;
  };
  tokens: Token;
}
export type RegisterResponse = ApiResponse<Register>;
