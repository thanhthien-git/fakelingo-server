import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUser, User, UserDocument } from 'src/schemas/user-schema';
import { RegisterDto } from './dtos/register.dto';
import { TokenPayload } from 'src/interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { ROLE } from 'src/enums/role.enum';
import { TokenService } from '../token/token/token.service';
import { CreateTokenDto } from '../token/token/dto/generate-token.dto';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private tokenService: TokenService,
  ) {}

  async hashedPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async register(dto: RegisterDto): Promise<string> {
    const { email, password, rePassword, userName } = dto;
    try {
      if (password !== rePassword) {
        throw new BadRequestException('Passwords do not match');
      }
      const hashed = await this.hashedPassword(password);
      const user: IUser = {
        email: email,
        _id: new Types.ObjectId(),
        userName: userName,
        password: hashed,
        role: ROLE.USER,
        currentLevel: '',
        createAt: new Date(),
      };

      await this.userModel.insertOne(user);
      const tokenDto: CreateTokenDto = {
        role: ROLE.USER,
        userId: String(user._id),
        userName: userName,
      };
      return await this.tokenService.generateToken(tokenDto);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  async login(dto: LoginDto): Promise<string> {
    try {
      const { email, password } = dto;
      const user = await this.userModel.findOne({
        email: email,
      });
      if (!user) {
        throw new BadRequestException('User does not exist!');
      }

      const isMatch = await this.comparePassword(password, user.password);
      if (!isMatch) {
        throw new BadRequestException('Password does not match!');
      }

      const payload: CreateTokenDto = {
        role: user.role as ROLE,
        userId: String(user._id),
        userName: user.userName,
      };

      return await this.tokenService.generateToken(payload);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }
}
