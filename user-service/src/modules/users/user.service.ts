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
import { LoginDto } from './dtos/login.dto';
import { UpdateFcmTokenDto } from './dtos/update-fcm-token';
import { CreateSocialUserDto } from './dtos/create-social-account.dto';
import { CacheService } from '@fakelingo/cache-lib';
import { RedisClientType } from 'redis';
@Injectable()
export class UserService {
  private readonly storage = process.env.CLOUDINARY_API;
  private cacheKey = (id: string) => `user:profile:${id}`;
  private cache: RedisClientType;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private cachingService: CacheService,
    private tokenService: TokenService,
  ) {
    this.cache = cachingService.getClient();
  }

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
      const isExist = !!(await this.userModel.findOne({
        $or: [{ email: dto.email }, { userName: userName }],
      }));

      if (isExist) {
        const hashed = await this.hashedPassword(password);

        const user: IUser = {
          email: email,
          _id: new Types.ObjectId(),
          userName: userName,
          password: hashed,
          role: ROLE.USER,
          createAt: new Date(),
          profile: {},
        };

        await this.userModel.insertOne(user);

        const tokenDto: CreateTokenDto = {
          role: ROLE.USER,
          userId: String(user._id),
          userName: userName,
        };

        return await this.tokenService.generateToken(tokenDto);
      }
      return 'Tài khoản đã tồn tại';
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async findOrCreateByGoogle(dto: CreateSocialUserDto): Promise<string> {
    const { email, googleId, name, avatar } = dto;

    const existing = await this.userModel.findOne({
      $or: [{ email }, { googleId }],
    });

    if (existing) {
      const tokenDto: CreateTokenDto = {
        role: ROLE.USER,
        userId: String(existing._id),
        userName: existing.userName,
      };

      return await this.tokenService.generateToken(tokenDto);
    }

    const newUser: IUser = {
      _id: new Types.ObjectId(),
      email,
      googleId,
      userName: `user${googleId}`,
      password: '',
      role: ROLE.USER,
      createAt: new Date(),
      profile: {
        name: name,
        photos: [avatar],
      },
    };

    await this.userModel.insertOne(newUser);

    const tokenDto: CreateTokenDto = {
      role: ROLE.USER,
      userId: String(newUser._id),
      userName: newUser.userName,
    };

    return await this.tokenService.generateToken(tokenDto);
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
          $set: { 'profile.photos': urls.data },
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
      const { location, preferences, gender } = condition;

      const leftSwipedIds = await this.cache.sMembers(`swipe:left:${userId}`);
      const excludedUserIds = leftSwipedIds.map((id) => new Types.ObjectId(id));

      const baseQuery: any = {
        _id: {
          $ne: new Types.ObjectId(userId),
          $nin: excludedUserIds,
        },
      };

      const query: any = { ...baseQuery };
      const orConditions = [];

      if (gender) {
        orConditions.push({ 'profile.gender': gender });
        baseQuery['profile.gender'] = gender;
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

      if (location?.coordinates && preferences.max_distance) {
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

      let users: IUserResponse[] = await this.userModel
        .find(query)
        .limit(limit)
        .select('-password')
        .exec();

      if (users.length === 0) {
        const aggregateQuery: any[] = [
          { $match: baseQuery },
          { $sample: { size: limit } },
          { $project: { password: 0 } },
        ];

        users = await this.userModel.aggregate(aggregateQuery).exec();
      }

      return users;
    } catch (err) {
      console.error('Error in findUserByCondition:', err);
      throw new BadRequestException(err.message || 'Something went wrong');
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
