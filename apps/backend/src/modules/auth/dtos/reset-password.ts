import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';
import { LocalSignInDto } from './local-signin.dto';

export class ResetPasswordDto extends PickType(LocalSignInDto, [
  'password',
] as const) {
  @IsString()
  @IsNotEmpty()
  token!: string;
}
