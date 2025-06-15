import { InjectModel } from '@nestjs/mongoose';
import { IUser, IUserResponse, User } from './schema/user-schema';
import { Model, Types } from 'mongoose';
import { RegisterDto } from './dtos/register.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ROLE } from 'src/enums/role.enum';
import { CreateTokenDto } from './dtos/generate-token.dto';
import { TokenService } from '../token/token.service';
import { UpdateProfileDto } from './dtos/update.dto';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';
import { ERROR } from 'src/constants/message';
import axios from 'axios';
import { FeedNewUserDto } from './dtos/feed-new-user.dto';
import * as FormData from 'form-data';
import * as bcrypt from 'bcrypt';
import { CacheService } from '@fakelingo/cache-lib';
import { LoginDto } from './dtos/login.dto';
import { UpdateFcmTokenDto } from './dtos/update-fcm-token';

@Injectable()
export class UserService {
  private readonly storage = process.env.CLOUDINARY_API;
  private cacheKey = (id: string) => `user:profile:${id}`;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private cachingService: CacheService,
    private tokenService: TokenService,
  ) {}

  private async comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  private async hashedPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async validateUser(dto: LoginDto): Promise<IUserResponse> {
    try {
      const user = await this.userModel
        .findOne({
          email: dto.email,
        })
        .select('+password');

      const isAuth = await this.comparePassword(dto.password, user.password);
      if (!isAuth) {
        throw new UnauthorizedException();
      }
      const { password, profile, createAt, ...userPayload } = user.toObject();
      return userPayload as IUserResponse;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  async createUser(dto: RegisterDto): Promise<string> {
    const { email, password, userName } = dto;
    try {
      const hashed = await this.hashedPassword(password);
      const user: IUser = {
        email: email,
        _id: new Types.ObjectId(),
        userName: userName,
        password: hashed,
        role: ROLE.USER,
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
      throw new InternalServerErrorException(err);
    }
  }

  async getProfileById(userId: string): Promise<IUserResponse> {
    try {
      const cacheKey = this.cacheKey(userId);
      let user: IUserResponse = await this.cachingService.get(cacheKey);
      if (user) {
        return user;
      }
      user = await this.userModel.findById(new Types.ObjectId(userId));
      this.cachingService.set(cacheKey, user);
      return user;
    } catch (err) {
      throw new BadRequestException({ message: ERROR.FAILED_QUERY });
    }
  }

  async getUserByIds(userIds: string[]): Promise<IUserResponse[]> {
    try {
      let users: IUserResponse[] = [];

      const objIds = userIds.map((userId: string) => {
        return new Types.ObjectId(userId);
      });

      users = await this.userModel.find({
        _id: {
          $in: objIds,
        },
      });

      //non blocking
      setImmediate(() => {
        users.forEach((user) => {
          this.cachingService
            .set(this.cacheKey(String(user._id)), user)
            .catch((err) => {
              console.log(
                `Redis cache set failed for user ${user._id}: ${err}`,
              );
            });
        });
      });

      return users;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  private getUpdateField(obj: Object, fieldName: string) {
    const updateFields = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        updateFields[`${fieldName}.${key}`] = value;
      }
    }

    return updateFields;
  }

  async updateProfile(dto: UpdateProfileDto): Promise<void> {
    try {
      const { profile, userId } = dto;
      const cacheKey = this.cacheKey(userId);
      const updateFields = this.getUpdateField(profile, 'profile');
      await this.userModel.updateOne(
        { _id: new Types.ObjectId(userId) },
        { $set: updateFields },
      );
      await this.cachingService.set(cacheKey, profile);
    } catch (err) {
      throw new BadRequestException({ message: ERROR.FAILED_UPDATE });
    }
  }

  async updatePrefenrences(dto: UpdatePreferencesDto): Promise<void> {
    try {
      const { preferences, userId } = dto;
      const updateFields = this.getUpdateField(
        preferences,
        'profile.preferences',
      );
      await this.userModel.updateOne(
        { _id: new Types.ObjectId(userId) },
        {
          $set: updateFields,
        },
      );
    } catch (err) {
      throw new BadRequestException({ message: ERROR.FAILED_UPDATE });
    }
  }

  async updatePhotos(
    photos: Express.Multer.File[],
    userId: string,
  ): Promise<void> {
    try {
      if (!photos || photos.length === 0) {
        throw new BadRequestException({ message: 'No files provided' });
      }
      const formData = new FormData();
      photos.forEach((photo) => {
        formData.append('files', photo.buffer, {
          filename: photo.originalname,
          contentType: photo.mimetype,
        });
      });

      const urls = await axios.post(this.storage, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      await this.userModel.updateOne(
        {
          _id: new Types.ObjectId(userId),
        },
        {
          $set: { 'profile.photos': urls },
        },
      );
    } catch (err) {
      throw new BadRequestException({ message: ERROR.FAILED_UPDATE });
    }
  }

  async deleteAccount(userId: string) {
    try {
      return await this.userModel.findByIdAndDelete(new Types.ObjectId(userId));
    } catch (err) {
      throw new BadRequestException({
        message: 'Cannot delete this account    ',
      });
    }
  }

  async findUserByCondition(
    dto: FeedNewUserDto,
    limit = 10,
    userId: string,
  ): Promise<IUserResponse[]> {
    try {
      const { condition } = dto;
      const { location, preferences } = condition;
      const query: any = {
        _id: { $ne: new Types.ObjectId(userId) },
      };

      const orConditions = [];

      if (preferences.gender) {
        orConditions.push({ 'profile.gender': preferences.gender });
      }

      if (preferences.ageRange) {
        orConditions.push({
          'profile.age': {
            $gte: preferences.ageRange.min,
            $lte: preferences.ageRange.max,
          },
        });
      }

      if (orConditions.length > 0) {
        query.$or = orConditions;
      }

      if (location && location.coordinates && preferences.max_distance) {
        query['profile.location'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: location.coordinates,
            },
            $maxDistance: preferences.max_distance * 1000,
          },
        };
      }

      const users: IUserResponse[] = await this.userModel
        .find(query)
        .limit(limit)
        .select('-password')
        .exec();

      return users;
    } catch (err) {
      console.log('Error stack:', err.stack);
      throw new BadRequestException(err);
    }
  }

  async updateUserFcmToken(dto: UpdateFcmTokenDto, userId: string) {
    return await this.userModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(userId),
      },
      {
        fcmToken: dto.fcmToken,
      },
    );
  }
}
