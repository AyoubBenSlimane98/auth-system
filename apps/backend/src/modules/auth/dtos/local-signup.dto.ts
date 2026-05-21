import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class LocalSignUpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[\p{L}\s-]+$/u, {
    message: 'firstName must contain only letters, spaces or hyphens',
  })
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[\p{L}\s-]+$/u, {
    message: 'lastName must contain only letters, spaces or hyphens',
  })
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
