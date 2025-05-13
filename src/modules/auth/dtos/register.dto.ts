import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  userName: string;

  @ApiProperty({ type: String, required: true, minItems: 8 })
  @IsNotEmpty()
  @MinLength(8, { message: 'At least 8 characters' })
  password: string;

  @ApiProperty({ type: String, required: true, minItems: 8 })
  @IsNotEmpty()
  @MinLength(8, { message: 'At least 8 characters' })
  @ValidateIf((o) => o.password === o.rePassword)
  rePassword: string;
}
