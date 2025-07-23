import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from 'src/modules/auth/dtos/register.dto';
import { LoginDto } from 'src/modules/auth/dtos/login.dto';
import { HttpService } from '@nestjs/axios';
import { ITokenPayload, TokenService } from 'fakelingo-token';
import { ROLE } from './enums/role.enum';
import { IUserResponse } from './schema/user-schema';
import { CreateSocialUserDto } from './dtos/create-social-account.dto';

@Injectable()
export class AuthService {
  private readonly USER_SERVICE_ENDPOINT = process.env.USER_SERVICE;

  constructor(
    private readonly httpService: HttpService,
    private tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<string> {
    const { password, rePassword } = dto;
    try {
      if (password !== rePassword) {
        throw new BadRequestException('Passwords do not match');
      }
      const response = await this.httpService
        .post(`${this.USER_SERVICE_ENDPOINT}/user/create`, dto)
        .toPromise();

      return response.data;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async login(dto: LoginDto) {
    try {
      const response = await this.httpService
        .post(`${this.USER_SERVICE_ENDPOINT}/user/validate-user`, dto)
        .toPromise();

      const user = response.data as IUserResponse;
      const payload: ITokenPayload = {
        role: user.role as ROLE,
        userId: String(user._id),
        userName: user.userName,
      };

      const token = await this.tokenService.generateToken(payload);
      return token;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException(err);
    }
  }

  async handleGoogleLogin(googleUser: CreateSocialUserDto) {
    const { email } = googleUser;

    if (!email) {
      throw new BadRequestException('Google account must have an email');
    }

    const response = await this.httpService
      .post(`${this.USER_SERVICE_ENDPOINT}/user/find-or-create`, googleUser)
      .toPromise();

    return response.data;
  }
}
