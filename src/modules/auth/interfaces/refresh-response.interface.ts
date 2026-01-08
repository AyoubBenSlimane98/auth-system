import { ApiResponse } from 'src/common/interfaces';

export interface Refresh {
  user_id: string;
  access_token: string;
}
export type RefreshResponse = ApiResponse<Refresh>;
