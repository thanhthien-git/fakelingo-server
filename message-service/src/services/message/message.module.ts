import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessageService } from './message.service';
import { NotificationService } from '../notification/notification.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'NOTIFICATION_QUEUE',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [MessageService, NotificationService],
  exports: [MessageService],
})
export class MessageModule {}
