import { PickType } from '@nestjs/mapped-types';
import { LocalSignUpDto } from '@modules/auth/dtos';

export class LocalSignInDto extends PickType(LocalSignUpDto, [
  'email',
  'password',
] as const) {}
