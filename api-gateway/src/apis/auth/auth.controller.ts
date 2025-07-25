import {
  Controller,
  Post,
  Body,
  BadGatewayException,
  UnauthorizedException,
  Get,
  Res,
  Query,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { ProxyService } from '../proxy/proxy.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { CONFIG } from 'src/config/config';

@Controller('auth')
export class AuthController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 502, description: 'Bad Gateway' })
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
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @Get('google')
  async redirectToGoogle(@Res() res: Response) {
    return res.redirect(`${CONFIG.AUTH_SERVICE.url}/auth/google`);
  }

  @Get('google/callback')
  handleGoogleRedirect(@Query('token') token: string) {
    return token;
  }
}
