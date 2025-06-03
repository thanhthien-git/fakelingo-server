import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationGateway } from './notification.gateway';
import { Notification } from 'src/schema/notification.schema';
import { INotificationPayload } from 'src/interfaces/INotificationContent';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private readonly gateway: NotificationGateway,
  ) {}

  async sendNotification(payload: INotificationPayload) {
    const saved = await this.notificationModel.create({
      ...payload,
      read: false,
    });

    this.gateway.emitToUser(payload.userId, saved as INotificationPayload);
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
