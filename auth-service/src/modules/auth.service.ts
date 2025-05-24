import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from 'src/dtos/register.dto';
import { LoginDto } from 'src/dtos/login.dto';

@Injectable()
export class AuthService {
  private async comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async register(dto: RegisterDto): Promise<string> {
    const { password, rePassword } = dto;
    try {
      if (password !== rePassword) {
        throw new BadRequestException('Passwords do not match');
      }
      return '';
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async login(dto: LoginDto) {
    try {
      const { email, password } = dto;
      // const user = await this.userModel.findOne({
      //   email: email,
      // });
      // if (!user) {
      //   throw new BadRequestException('User does not exist!');
      // }
      // const isMatch = await this.comparePassword(password, user.password);
      // if (!isMatch) {
      //   throw new BadRequestException('Password does not match!');
      // }

      // const payload: CreateTokenDto = {
      //   role: user.role as ROLE,
      //   userId: String(user._id),
      //   userName: user.userName,
      // };

      // return await this.tokenService.generateToken(payload);
    } catch (err) {
      throw new BadRequestException({ message: err });
    }
  }
}
