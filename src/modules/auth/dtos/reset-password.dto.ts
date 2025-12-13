import { PickType } from '@nestjs/mapped-types';
import { LoginDto } from './login.dto';

export class ResetPasswordDto extends PickType(LoginDto, ['email'] as const) {}
