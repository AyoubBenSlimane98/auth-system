import { ApiResponse } from 'src/common/interfaces';

export interface Logout {
  user_id: string;
  token_id: string;
}
export type LogoutResponse = ApiResponse<Logout>;
