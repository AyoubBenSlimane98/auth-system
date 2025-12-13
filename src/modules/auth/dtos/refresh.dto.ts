import { PickType } from '@nestjs/mapped-types';
import { LogoutDto } from './logout.dto';

export class RefreshDto extends PickType(LogoutDto, [
  'token_id',
  'refresh_token',
] as const) {}
