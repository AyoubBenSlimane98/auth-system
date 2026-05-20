import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ProviderEnum } from '@modules/providers/enums';

export class GoogleDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  provider_user_id!: string;

  @IsString()
  first_name!: string | undefined;

  @IsString()
  last_name!: string | undefined;

  @IsString()
  avatar_url!: string | undefined;

  @IsEnum(ProviderEnum)
  type!: ProviderEnum;
}
