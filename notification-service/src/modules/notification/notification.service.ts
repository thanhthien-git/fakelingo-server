import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from 'src/schema/notification.schema';
import { admin } from '../firebase/firebase-admin';
import { CacheService } from '@fakelingo/cache-lib';
import { UpdateFcmTokenDto } from './dtos/update-fcm-token';
import { RedisClientType } from 'redis';
import { NotificationPayloadDto } from './dtos/send-notification-payload';
import { SendMatchedNotiDto } from './dtos/matched-notification.dto';

@Injectable()
export class NotificationService {
  private readonly FCM_TOKEN_KEY = (userId: string) => `fcmToken:${userId}`;
  private cache: RedisClientType;
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private cacheService: CacheService,
  ) {
    this.cache = cacheService.getClient();
  }

  async sendMatchedNotification(payload: SendMatchedNotiDto) {
    try {
      const { firstUser, secondUser } = payload;
      const fcmTokens = await this.getUserFcmToken([firstUser, secondUser]);

      console.log(fcmTokens);

      const message = {
        title: 'Bạn có thông báo mới',
        body: 'Bạn vừa được ghép đôi với một người khác',
      };

      if (fcmTokens) {
        await admin.messaging().sendEach([
          {
            token: fcmTokens[0],
            notification: message,
          },
          {
            token: fcmTokens[1],
            notification: message,
          },
        ]);
      }

      const insertContent = {
        title: message.title,
        message: message.body,
        read: false,
        type: 'like',
        createdAt: new Date(),
      };

      await this.notificationModel.insertMany([
        {
          userId: firstUser,
          ...insertContent,
        },
        {
          userId: secondUser,
          ...insertContent,
        },
      ]);
    } catch (err) {
      console.error('FCM ERROR:', err);
      throw new BadGatewayException({ message: 'FAILED TO SEND NOTIFICATION' });
    }
  }

  async sendNotification(payload: NotificationPayloadDto) {
    try {
      const { userId, title, type } = payload;

      const fcmToken = await this.getUserFcmToken([userId]);
      let convertBodyMessage = this.getBodyContent(payload);

      if (fcmToken.length > 0 && fcmToken[0]) {
        await admin.messaging().send({
          token: fcmToken[0],
          notification: {
            title,
            body: convertBodyMessage,
          },
          data: {
            userId,
          },
        });
      }

      await this.notificationModel.create({
        userId,
        title,
        message: convertBodyMessage,
        read: false,
        type: type,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error('FCM ERROR:', err);
      throw new BadGatewayException({ message: 'FAILED TO SEND NOTIFICATION' });
    }
  }

  private getBodyContent(payload: NotificationPayloadDto): string {
    const { type, fromUserId, userId } = payload;
    let body = payload.body;
    switch (type) {
      case 'like':
        body = `${fromUserId} đã thích bạn`;
        break;
      case 'match':
        body = `Bạn vừa được ghép đôi với ${userId}`;
        break;
      case 'message':
        body = `${fromUserId} đã gửi cho bạn 1 tin nhắn mới`;
        break;
    }

    return body;
  }

  async getNofitication(userId: string): Promise<Notification[]> {
    return await this.notificationModel.find({ userId: userId });
  }

  async markAsRead(notificationId: string) {
    return await this.notificationModel.findByIdAndUpdate(notificationId, {
      read: true,
    });
  }

  async updateFcmToken(userId: string, dto: UpdateFcmTokenDto) {
    const key = this.FCM_TOKEN_KEY(userId);
    const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

    return await this.cache.set(key, dto.fcmToken, {
      EX: SEVEN_DAYS_IN_SECONDS,
    });
  }

  private async getUserFcmToken(userIds: string[]): Promise<string[]> {
    const tokens = await Promise.all(
      userIds.map(async (userId: string) => {
        const token = (await this.cache.get(
          this.FCM_TOKEN_KEY(userId),
        )) as string;
        return token;
      }),
    );
    return tokens.filter((token): token is string => !!token);
  }
}
