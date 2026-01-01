import { ApiResponse } from 'src/common/interfaces';
import { Token } from './register-response.interface';

export interface Login {
  user_id: string;
  tokens: Token;
}
export type LoginResponse = ApiResponse<Login>;
