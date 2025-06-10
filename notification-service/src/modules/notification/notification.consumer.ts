import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { NotificationPayloadDto } from 'src/interfaces/INotification-payload';

@Controller()
export class NotificationConsumer {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('notification.queue')
  async handleNotification(@Payload() payload: NotificationPayloadDto) {
    await this.notificationService.sendNotification(payload);
  }
}
