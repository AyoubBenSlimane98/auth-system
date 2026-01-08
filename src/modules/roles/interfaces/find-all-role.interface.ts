import { ApiResponse } from 'src/common/interfaces';

export interface Role {
  role_id: string;
  name: string;
  description: string | null;
}

export type FindAllResponse = ApiResponse<{
  roles: Role[];
}>;
