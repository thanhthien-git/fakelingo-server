// api-gateway/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { HttpGlobalExceptionFilter } from './exeption-filter/filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'gateway_queue',
      queueOptions: { durable: false },
    },
  });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpGlobalExceptionFilter());

  await app.startAllMicroservices();
  await app.listen(8080, () => {
    console.log(`api gateway is running on port : 8080`);
  });
}
bootstrap();
