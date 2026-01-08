import { ApiResponse } from 'src/common/interfaces';

export interface AssignmentResult {
  requested: number;
  assigned: number;
  skipped?: number;
}
export type AssignPermissionsResponse = ApiResponse<AssignmentResult>;
