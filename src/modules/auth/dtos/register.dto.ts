import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { AuthProvider } from 'src/common/enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsEnum(AuthProvider, { message: 'Invalied provider' })
  provider: AuthProvider;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsNotEmpty()
  @Matches(/^\+\d{1,3}$/, {
    message: 'Should start with + and contain 1 to 3 digits',
  })
  area_code: string;

  @IsNotEmpty()
  @Matches(/^\d{6,12}$/, {
    message: 'Phone number must contain 6 to 12 digits',
  })
  phone_number: string;
}
