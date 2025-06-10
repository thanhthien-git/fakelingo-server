import { CacheService } from '@fakelingo/cache-lib';
import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import { Model, Types } from 'mongoose';
import { ISwipe, Swipe, SwipeType } from 'src/schema/swipe.schema';
import { SwipeDto, SwipePayloadDto } from './dto/swipe-dto';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class SwipeService {
  private cache: RedisClientType;
  private readonly FEED_KEY = (userId: string) => `feeds:userId:${userId}`;
  private readonly MATCH_KEY = (userId: string) => `match:${userId}`;
  private readonly SWIPE_KEY = (userId: string) => `swipe:left:${userId}`;
  private readonly EXPIRE_TIME = 3600;

  private readonly MATCH_SERVICE = process.env.MATCH_SERVICE;

  constructor(
    @InjectModel(Swipe.name) private swipeModel: Model<Swipe>,
    private cacheService: CacheService,
    private httpService: HttpService,
    @Inject('NOTIFICATION_SERVICE_CLIENT')
    private readonly notificationProxy: ClientProxy,
  ) {
    this.cache = cacheService.getClient();
  }

  private async createSwipe(swipe: ISwipe) {
    try {
      await this.swipeModel.create(swipe);
    } catch (err) {
      throw new BadGatewayException(
        err.message || 'Unexpected error when create swipe',
      );
    }
  }
  async handleSwipe(userId: string, dto: SwipeDto) {
    try {
      const { type, targetUserId } = dto;
      await this.createSwipe({
        _id: new Types.ObjectId(),
        sendFromId: new Types.ObjectId(userId),
        targetUserId: dto.targetUserId,
        type: dto.type,
      });

      const payload: SwipePayloadDto = {
        type: "LIKE",
        sendFromUser: userId,
        targetUser: String(targetUserId),
      };

      if (type === SwipeType.L) {
        this.handleSwipeLeft(payload);
      }

      if (type === SwipeType.R) {
        this.handleSwipeRight(payload);
      }
    } catch (err) {
      throw new BadGatewayException(
        err.message || 'Unexpected error when solving swipe',
      );
    }
  }

  private async handleSwipeLeft(payload: SwipePayloadDto) {
    const { sendFromUser, targetUser } = payload;
    const key = this.SWIPE_KEY(sendFromUser);
    await this.cache.sAdd(key, targetUser);
    await this.cache.expire(key, this.EXPIRE_TIME);
  }

  private async handleSwipeRight(payload: SwipePayloadDto) {
    const data = {
      ...payload,
      timestamp: new Date().toISOString(),
    };

    await this.notificationProxy.emit('notification_queue', data).toPromise();
  }
}
