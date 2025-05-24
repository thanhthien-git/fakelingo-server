import { Transport, ClientProviderOptions } from '@nestjs/microservices';
import { CONFIG } from './config/config';

export function createRmqClients(rmqUrl: string): ClientProviderOptions[] {
  return [
    {
      name: CONFIG.AUTH_SERVICE.service,
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: CONFIG.AUTH_SERVICE.queue,
        queueOptions: { durable: false },
      },
    },
    {
      name: CONFIG.USER_SERVICE.service,
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: CONFIG.USER_SERVICE.queue,
        queueOptions: { durable: false },
      },
    },
    {
      name: CONFIG.FEED_SERVICE.service,
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: CONFIG.FEED_SERVICE.queue,
        queueOptions: { durable: false },
      },
    },
    {
      name: CONFIG.MESSAGE_SERVICE.service,
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: CONFIG.MESSAGE_SERVICE.queue,
        queueOptions: { durable: false },
      },
    },
    {
      name: CONFIG.SWIPE_SERVICE.service,
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: CONFIG.SWIPE_SERVICE.queue,
        queueOptions: { durable: false },
      },
    },
    {
      name: CONFIG.NOTIFICATION_SERVICE.service,
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: CONFIG.NOTIFICATION_SERVICE.queue,
        queueOptions: { durable: false },
      },
    },
  ];
}
