import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  userName: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  @ValidateIf((o) => o.password === o.rePassword)
  rePassword: string;
}
