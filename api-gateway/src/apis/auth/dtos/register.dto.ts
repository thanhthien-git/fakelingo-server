import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'john' })
  @IsNotEmpty()
  userName: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'At least 8 characters' })
  @MinLength(8, { message: 'At least 8 characters' })
  password: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'At least 8 characters' })
  @ApiProperty({ example: 'At least 8 characters' })
  @ValidateIf((o) => o.password === o.rePassword)
  rePassword: string;
}
