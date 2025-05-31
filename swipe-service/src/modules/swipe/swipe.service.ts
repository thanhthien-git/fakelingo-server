import { CacheService } from '@fakelingo/cache-lib';
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import { Model } from 'mongoose';
import { Swipe, SwipeType } from 'src/schema/swipe.schema';
import { SwipeDto } from './dto/swipe-dto';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SwipeService {
  private cache: RedisClientType;
  private readonly FEED_KEY = (userId: string) => `feeds:userId:${userId}`;
  private readonly MATCH_KEY = (userId: string) => `match:${userId}`;

  private readonly MATCH_SERVICE = process.env.MATCH_SERVICE;

  constructor(
    @Inject(Swipe) private swipeModel: Model<Swipe>,
    private cacheService: CacheService,
    private httpService: HttpService,
  ) {
    this.cache = cacheService.getClient();
  }

  async handleSwipe(userId: string, dto: SwipeDto): Promise<Object> {
    const { targetUserId, type } = dto;
    const feedKey = this.FEED_KEY(userId);

    //remove user from cache
    await this.cache.lRem(feedKey, 0, String(targetUserId));

    if (type === SwipeType.L) return await this.handleSwipeLeft();

    //double-check is existed match in db
    const targetMatchKey = this.MATCH_KEY(String(targetUserId));
    const isMutual = await this.cache.sIsMember(targetMatchKey, userId);

    if (isMutual) {
      //add match
      await this.cache.sAdd(this.MATCH_KEY(userId), String(targetUserId));

      //send message-broker to match-service -> notification-service
      const response = await this.httpService
        .post(`${this.MATCH_SERVICE}/match`, dto)
        .toPromise();

      return response.data;
    }
  }

  async handleSwipeLeft() {
    return 'skipped';
  }
}
