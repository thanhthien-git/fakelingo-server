import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUserResponse, User } from 'src/schemas/user-schema';
import { FeedNewUserDto } from './dtos/get-list.dto';
import { CustomLogger } from '../logger-service/logger.service';
import { CachingService } from '../caching-service/src/caching.service';
import { RedisClientType } from 'redis';
import { UserService } from 'src/user-service/user.service';

@Injectable()
export class FeedService {
  private readonly logger = new CustomLogger(FeedService.name);
  private readonly cacheKey = (key: string) => `feeds:userId:${key}`;
  private readonly FEED_LIMIT = 10;
  private cache: RedisClientType;
  constructor(
    @InjectModel(User.name) private userModel: User,
    private cacheService: CachingService,
    private userService: UserService,
  ) {
    this.cache = this.cacheService.getClient();
  }

  private async getCacheFeedByUser(userId: string): Promise<string[]> {
    try {
      const cacheKey = this.cacheKey(userId);
      const userIds = await this.cache.lRange(cacheKey, 0, 9);
      return [];
    } catch (err) {
      this.logger.error(`Error why getting feed from cache ${err}`);
      throw new BadRequestException({ message: 'Try again later!' });
    }
  }

  async getNextFeed(
    userId: string,
    feedDto: FeedNewUserDto,
  ): Promise<IUserResponse[]> {
    try {
      const key = this.cacheKey(userId);
      let users: IUserResponse[] = [];

      users = await this.userService.findUserByCondition(feedDto, 10, userId);

      return users;
    } catch {
      this.logger.error('Error when get user feeding');
      throw new BadRequestException({ message: 'Can not load your feed!' });
    }
  }
}
