import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  new_password: string;
}
