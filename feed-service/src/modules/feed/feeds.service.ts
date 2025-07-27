import { CacheService } from '@fakelingo/cache-lib';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUserResponse, User } from 'src/schema/user-schema';
import { FeedNewUserDto } from './dtos/get-list.dto';
import { RedisClientType } from '@redis/client';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { IUserReq } from 'src/interfaces/user.request';

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
    reqPayload: IUserReq,
    feedDto: FeedNewUserDto,
  ): Promise<IUserResponse[]> {
    try {
      const key = this.cacheKey(reqPayload.userId);
      let users: IUserResponse[] = [];

      const cacheIds = await this.cache.lRange(key, 0, this.FEED_LIMIT - 1);

      if (cacheIds.length) {
        await this.cache.lTrim(key, this.FEED_LIMIT, -1);

        users = await this.userModel
          .find({ _id: { $in: cacheIds } })
          .select('-password')
          .lean();

        return users;
      }

      // GỌI user-service đã tự xử lý loại trừ left/match
      const usersFromService = await this.getByCondition(feedDto, reqPayload);

      const filteredIds = usersFromService.map((u) => String(u._id));

      if (filteredIds.length) {
        await this.cache.rPush(key, filteredIds);
        await this.cache.expire(key, 3600);
        await this.cache.lTrim(key, this.FEED_LIMIT, -1);
      }

      return usersFromService.slice(0, this.FEED_LIMIT);
    } catch (err) {
      console.error(err);
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
    userPayload: IUserReq,
  ): Promise<IUserResponse[]> {
    try {
      const response = await this.httpService
        .post(`${this.USER_SERVICE_ENDPOINT}/user/find-by-condition`, feedDto, {
          headers: {
            'x-user-payload': JSON.stringify(userPayload),
            Authorization: userPayload.token,
          },
        })
        .toPromise();
      return response.data;
    } catch (err) {
      console.log(
        `error when find user by condition - calling to user-service`,
      );
      console.log(err);
      throw new BadRequestException({ message: 'Can not load your feed!' });
    }
  }
}
