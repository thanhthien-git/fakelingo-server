import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from 'src/modules/auth/dtos/register.dto';
import { LoginDto } from 'src/modules/auth/dtos/login.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { IUserRequest } from 'fakelingo-token';
import { CreateSocialUserDto } from './dtos/create-social-account.dto';
import { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject('GOOGLE_OAUTH_CLIENT')
    private readonly oauthClient: OAuth2Client,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('google/mobile')
  async googleMobile(@Body('idToken') idToken: string) {
    console.log('hit');
    console.log(idToken);

    const ticket = await this.oauthClient.verifyIdToken({
      idToken,
      audience: [
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_MOBILE_CLIENT_ID,
      ],
    });

    const payload = ticket.getPayload();

    const dto: CreateSocialUserDto = {
      email: payload.email,
      googleId: payload.sub,
      avatar: payload.picture,
      name: payload.name,
    };

    return this.authService.handleGoogleLogin(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const token = await this.authService.handleGoogleLogin(req.user);

    const redirectUrl = `${process.env.API_GATEWAY}/auth/google/callback?token=${token}`;
    return res.redirect(redirectUrl);
  }
}
