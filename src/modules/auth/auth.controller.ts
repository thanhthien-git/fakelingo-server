import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return `login`;
  }

  @ApiBody({ type: RegisterDto })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return `register`;
  }
  Ơ;
}
