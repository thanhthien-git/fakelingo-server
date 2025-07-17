// rabbitmq.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CONFIG } from 'src/config/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATION_QUEUE',
        transport: Transport.RMQ,
        options: {
          urls: [CONFIG.rabbitmq],
          queue: 'notification_queue',
          queueOptions: { durable: false },
        },
      },
      {
        name: 'MATCH_QUEUE',
        transport: Transport.RMQ,
        options: {
          urls: [CONFIG.rabbitmq],
          queue: 'match_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQModule {}
