import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { INotificationPayload } from 'src/interfaces/INotificationContent';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationConsumer {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('notification.queue')
  async handleIncomingNotification(@Payload() payload: INotificationPayload) {
    await this.notificationService.sendNotification(payload);
  }
}
