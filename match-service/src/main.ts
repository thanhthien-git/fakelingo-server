import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'match_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 8087);
}
bootstrap();
