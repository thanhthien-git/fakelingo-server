import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const port = process.env.PORT ?? 8088;
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'SWIPE_QUEUE',
      queueOptions: {
        durable: false,
      },
    },
  });
  app.use(new ValidationPipe());

  await app.startAllMicroservices();
  await app.listen(port);
  console.log(`SWIPE service is running on port ${port}`);
}
bootstrap();
