import { CacheService } from '@fakelingo/cache-lib';
import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import { Model, Types } from 'mongoose';
import { ISwipe, Swipe, SwipeType } from 'src/schema/swipe.schema';
import { SwipeDto, SwipePayloadDto } from './dto/swipe-dto';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { MatchedDto } from './dto/matched.dto';

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
    @Inject('NOTIFICATION_SERVICE_CLIENT')
    private readonly notificationProxy: ClientProxy,

    @Inject('MATCH_SERVICE_CLIENT')
    private readonly matchProxy: ClientProxy,
  ) {
    this.cache = cacheService.getClient();
  }

  private async createSwipe(swipe: ISwipe) {
    try {
      const { sendFromId, targetUserId } = swipe;
      const isExist: Swipe = await this.swipeModel.findOne({
        sendFromId: sendFromId,
        targetUserId: targetUserId,
      });

      if (isExist) {
        return isExist;
      }

      const newSwipe = await this.swipeModel.create(swipe);

      const reverseSwipe = await this.swipeModel.findOne({
        sendFromId: targetUserId,
        targetUserId: sendFromId,
      });

      const isMatched = !!reverseSwipe;

      if (isMatched) {
        //logic for creating a match
        const matchDto: MatchedDto = {
          fromUser: String(swipe.sendFromId),
          toUser: String(swipe.targetUserId),
        };

        await this.matchProxy.emit('user.matched', matchDto);
        await this.notificationProxy.emit('user.matched ', matchDto);

        return newSwipe;
      }
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
        type: 'LIKE',
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
    console.log(key);
  }

  private async handleSwipeRight(payload: SwipePayloadDto) {
    const data = {
      ...payload,
      timestamp: new Date().toISOString(),
    };

    await this.notificationProxy.emit('notification_queue', data).toPromise();
  }

  async getUnreadSwipe(userId: string, page = 1, limit = 10) {
    try {
      //paginated
      const skip = (page - 1) * limit;

      const liked = await this.swipeModel.aggregate([
        //match stage
        {
          $match: {
            targetUserId: new Types.ObjectId(userId),
          },
        },
        //lookup stage
        {
          $lookup: {
            from: ' swipes',
            let: { likedId: '$sendFromId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$sendFromId', new Types.ObjectId(userId)] },
                      { $eq: ['$targetUserId', '$$likedId'] },
                    ],
                  },
                },
              },
            ],
            as: 'response',
          },
        },
        {
          $match: {
            response: { $size: 0 },
          },
        },
        //lookup to user collection
        {
          $lookup: {
            from: 'users',
            localField: 'sendFromId',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
        //unwind stage
        {
          $unwind: '$userInfo',
        },
        {
          $replaceRoot: { newRoot: '$userInfo' },
        },
        //project stage
        {
          $project: {
            password: 0,
          },
        },
        //paginated
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);

      return liked;
    } catch (err) {
      throw new BadGatewayException(err);
    }
  }
}
