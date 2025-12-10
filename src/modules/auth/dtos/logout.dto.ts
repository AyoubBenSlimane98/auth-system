import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class LogoutDto {
  @IsUUID()
  token_id: string;

  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
