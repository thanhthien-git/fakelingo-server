import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'NOTIFICATION_QUEUE',
      queueOptions: { durable: false },
    },
  });
  
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 8086);
}
bootstrap();
