import { Provider } from '@nestjs/common';
import { createClient } from 'redis';

export const RedisClientProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: async () => {
    const client = createClient({
      url: `${process.env.REDIS_URL}`,
    });
    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await client.connect();
    return client;
  },
};
