export interface GooglePayload {
  providerId: string;
  email: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  picture: string | undefined;
  accessToken: string;
}
