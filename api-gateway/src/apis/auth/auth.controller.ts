import {
  Controller,
  Post,
  Body,
  BadGatewayException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { ProxyService } from '../proxy/proxy.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.proxyService.forwardRequest(
        'AUTH',
        'auth/register',
        'POST',
        dto,
      );
    } catch (err) {
      throw new BadGatewayException(err.message);
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.proxyService.forwardRequest(
        'AUTH',
        'auth/login',
        'POST',
        dto,
      );
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }
}
