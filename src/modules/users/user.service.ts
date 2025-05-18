import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUserResponse, User } from '../../schemas/user-schema';
import { CustomLogger } from '../logger/logger.service';
import { ERROR } from '../../constants/error';
import { CachingService } from '../caching/caching.service';
import { UpdateProfileDto } from './dtos/update.dto';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';
import axios from 'axios';
import FormData from 'form-data';
import { FeedNewUserDto } from '../feeds/dtos/get-list.dto';

@Injectable()
export class UserService {
  private readonly logger = new CustomLogger(UserService.name);
  private readonly storage = process.env.CLOUDINARY_API;
  private cacheKey = (id: string) => `user:profile:${id}`;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private cachingService: CachingService,
  ) {}

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
      this.logger.error(err);
      throw new BadRequestException({ message: ERROR.FAILED_QUERY });
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
      this.logger.error(err);
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
      this.logger.error(err);
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
        formData.append('files', photo.buffer, photo.originalname);
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
      this.logger.error(err);
      throw new BadRequestException({ message: ERROR.FAILED_UPDATE });
    }
  }

  async deleteAccount(userId: string) {
    try {
      return await this.userModel.findByIdAndDelete(new Types.ObjectId(userId));
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException({
        message: 'Cannot delete this account    ',
      });
    }
  }

  async findUserByCondition(dto: FeedNewUserDto, limit = 10, userId: string) {
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

      const users = await this.userModel.find(query).limit(limit).exec();
      const ids = users.map((user) => user._id);
      return ids;
    } catch (err) {
      this.logger.error(`error when getting user by condition: ${err.message}`);
      console.log('Error stack:', err.stack);
      throw new BadRequestException(err);
    }
  }
}
