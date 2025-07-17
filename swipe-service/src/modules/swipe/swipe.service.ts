import { CacheService } from '@fakelingo/cache-lib';
import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import { Model, Types } from 'mongoose';
import { ISwipe, Swipe, SwipeType } from 'src/schema/swipe.schema';
import { SwipeDto, SwipePayloadDto } from './dto/swipe-dto';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { MatchedDto } from './dto/matched.dto';
import { NotificationPayloadDto } from './dto/send-notification-payload';
import { MatchDto } from './dto/match.dto';

@Injectable()
export class SwipeService implements OnModuleInit {
  private cache: RedisClientType;
  private readonly FEED_KEY = (userId: string) => `feeds:userId:${userId}`;
  private readonly MATCH_KEY = (userId: string) => `match:${userId}`;
  private readonly SWIPE_KEY = (userId: string) => `swipe:left:${userId}`;
  private readonly EXPIRE_TIME = 3600;
  private readonly MATCH_SERVICE = process.env.MATCH_SERVICE;

  constructor(
    @InjectModel(Swipe.name) private swipeModel: Model<Swipe>,
    private cacheService: CacheService,
    @Inject('NOTIFICATION_QUEUE')
    private readonly notificationProxy: ClientProxy,
    @Inject('MATCH_QUEUE')
    private readonly matchProxy: ClientProxy,
  ) {
    this.cache = cacheService.getClient();
  }

  async onModuleInit() {
    await this.matchProxy.emit('pong', {}).toPromise();
  }

  private async createSwipe(swipe: ISwipe) {
    try {
      const { sendFromId, targetUserId } = swipe;

      const isExist: Swipe = await this.swipeModel.findOne({
        sendFromId: sendFromId,
        targetUserId: targetUserId,
      });

      if (isExist) {
        return { message: 'Bạn đã được ghép đôi với người này rồi' };
      }

      const newSwipe = await this.swipeModel.create(swipe);

      const reverseSwipe = await this.swipeModel.findOne({
        sendFromId: targetUserId,
        targetUserId: sendFromId,
      });

      const isMatched = !!reverseSwipe;

      if (isMatched) {

        const users: MatchDto = {
          swiper: sendFromId.toString(),
          target: targetUserId.toString(),
        };
        this.matchProxy.emit('match.create', users);

        this.notificationProxy.emit('notification_matched', {
          firstUser: sendFromId.toString(),
          secondUser: targetUserId.toString(),
        });
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
    const { sendFromUser, targetUser } = payload;

    await this.createSwipe({
      sendFromId: new Types.ObjectId(sendFromUser),
      targetUserId: new Types.ObjectId(targetUser),
      type: SwipeType.R,
      _id: new Types.ObjectId(),
    });

    const data: NotificationPayloadDto = {
      type: 'like',
      fromUserId: sendFromUser,
      userId: targetUser,
      body: '',
      title: '',
    };

    await this.notificationProxy.emit('notification_message', data).toPromise();
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
