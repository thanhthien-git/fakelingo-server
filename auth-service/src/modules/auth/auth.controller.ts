import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from 'src/modules/auth/dtos/register.dto';
import { LoginDto } from 'src/modules/auth/dtos/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  async login(@Body() dto: LoginDto) {
    console.log(`hit`);
    return this.authService.login(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
