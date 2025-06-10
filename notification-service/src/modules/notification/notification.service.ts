import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from 'src/schema/notification.schema';
import admin from '../firebase/firebase-admin';
import {
  NotificationPayloadDto,
  NotificationType,
} from 'src/interfaces/INotification-payload';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async sendNotification(payload: NotificationPayloadDto) {
    const { userId, title, fcmToken } = payload;

    let convertBodyMessage = this.getBodyContent(payload);

    if (fcmToken) {
      await admin.messaging().send({
        token: fcmToken,
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
      createdAt: new Date(),
    });
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
}
