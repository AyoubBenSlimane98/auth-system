import { PickType } from '@nestjs/mapped-types';
import { LocalSignUpDto } from './local-signup.dto';

export class LocalSignInDto extends PickType(LocalSignUpDto, [
  'email',
  'password',
] as const) {}
