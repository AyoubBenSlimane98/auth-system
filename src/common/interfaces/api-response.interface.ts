export interface ApiResponse<T> {
  status: boolean;
  error?: string;
  message: string;
  data?: T;
}
