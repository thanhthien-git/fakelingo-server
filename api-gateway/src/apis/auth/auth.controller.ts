import { Controller, Post, Body, BadGatewayException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { CONFIG } from 'src/config/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  private readonly AUTH_END_POINT = process.env.AUTH_SERVICE;
  constructor(private readonly httpService: HttpService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      const result = await firstValueFrom(
        this.httpService.post(`${this.AUTH_END_POINT}/auth/register`, dto),
      );
      return result.data;
    } catch (err) {
      throw new BadGatewayException(err);
    }
  }

  // @Post('login')
  // async login(@Body() dto: LoginDto) {}
}
