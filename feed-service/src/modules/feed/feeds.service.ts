import { CacheService } from '@fakelingo/cache-lib';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUserResponse, User } from 'src/schema/user-schema';
import { FeedNewUserDto } from './dtos/get-list.dto';
import { RedisClientType } from '@redis/client';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { IUserRequest } from 'fakelingo-token';

@Injectable()
export class FeedService {
  private readonly USER_SERVICE_ENDPOINT = process.env.USER_SERVICE;
  private readonly FEED_LIMIT = 10;
  private readonly matchKey = (userId: string) => `match:${userId}`;
  private readonly cacheKey = (key: string) => `feeds:userId:${key}`;

  private cache: RedisClientType;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private cacheService: CacheService,
    private httpService: HttpService,
  ) {
    this.cache = cacheService.getClient();
  }

  async getNextFeed(
    reqPayload: IUserRequest,
    feedDto: FeedNewUserDto,
  ): Promise<IUserResponse[]> {
    try {
      const key = this.cacheKey(reqPayload.userId);
      let users: IUserResponse[] = [];

      const cacheIds = await this.cache.lRange(key, 0, this.FEED_LIMIT - 1);

      if (cacheIds.length) {
        await this.cache.lTrim(key, this.FEED_LIMIT, -1);
        users = await this.userModel
          .find({
            _id: { $in: cacheIds },
          })
          .select('-password')
          .lean();

        return users;
      }
      const matchIdsInCache = await this.getMatchedUsers(reqPayload.userId);
      const leftSwipedIds = await this.cache.sMembers(
        `swipe:left:${reqPayload.userId}`,
      );

      users = await this.getByCondition(feedDto, reqPayload);

      const filteredIds = users.filter(
        (u) =>
          !matchIdsInCache.includes(String(u._id)) &&
          !leftSwipedIds.includes(String(u._id)),
      );
      
      const newUserIds = filteredIds.map((u) => String(u._id));

      if (newUserIds.length) {
        await this.cache.rPush(key, [...newUserIds]);
        await this.cache.expire(key, 3600);
      }

      const result = filteredIds.slice(0, this.FEED_LIMIT);
      await this.cache.lTrim(key, this.FEED_LIMIT, -1);
      return result;
    } catch {
      console.log(`error when find user by condition`);
      throw new BadRequestException({ message: 'Can not load your feed!' });
    }
  }

  private async getMatchedUsers(userId: string): Promise<string[]> {
    try {
      const key = this.matchKey(userId);
      return await this.cache.sMembers(key);
    } catch (err) {
      console.log(`Error when getting matched users by userId : ${userId}`);
      throw new BadRequestException(err);
    }
  }

  private async getByCondition(
    feedDto: FeedNewUserDto,
    userPayload: IUserRequest,
  ): Promise<IUserResponse[]> {
    try {
      const response = await this.httpService
        .post(`${this.USER_SERVICE_ENDPOINT}/user/find-by-condition`, feedDto, {
          headers: {
            'x-user-payload': JSON.stringify(userPayload),
          },
        })
        .toPromise();
      return response.data;
    } catch (err) {
      console.log(
        `error when find user by condition - calling to user-service`,
      );
      throw new BadRequestException({ message: 'Can not load your feed!' });
    }
  }
}
