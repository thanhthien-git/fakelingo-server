import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  userName: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'At least 8 characters' })
  password: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'At least 8 characters' })
  @ValidateIf((o) => o.password === o.rePassword)
  rePassword: string;
}