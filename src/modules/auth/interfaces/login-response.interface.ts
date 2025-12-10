import { Token } from './register-response.interface';

export interface LoginResponse {
  user_id: string;
  tokens: Token;
}
