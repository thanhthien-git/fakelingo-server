import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly client: ClientProxy,
  ) {}

  async pushNotification(data: {
    userId: string;
    title: string;
    body: string;
  }) { 
    this.client.emit('notification.queue', data);
  }
}
