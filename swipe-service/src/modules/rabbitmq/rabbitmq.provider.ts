import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';

export const RabbitMQProviders = [
  {
    provide: 'NOTIFICATION_SERVICE_CLIENT',
    useFactory: (): ClientProxy => {
      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'NOTIFICATION_QUEUE',
          queueOptions: {
            durable: true,
          },
        },
      });
    },
  },
  {
    provide: 'MATCH_SERVICE_CLIENT',
    useFactory: (): ClientProxy => {
      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'MATCH_QUEUE',
          queueOptions: {
            durable: true,
          },
        },
      });
    },
  },
];
