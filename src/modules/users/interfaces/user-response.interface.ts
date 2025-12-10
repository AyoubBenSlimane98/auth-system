import { ProfileResponse } from 'src/modules/profiles/interfaces';

export interface UserResponse {
  user_id: string;
  profile: ProfileResponse;
}
