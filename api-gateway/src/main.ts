// api-gateway/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { HttpGlobalExceptionFilter } from './exeption-filter/filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpGlobalExceptionFilter());

  await app.startAllMicroservices();

   const config = new DocumentBuilder()
    .setTitle('Fakelingo API')
    .setDescription('The Fakelingo API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);
  await app.listen(8080, () => {
    console.log(`api gateway is running on port : 8080`);
  });
}
bootstrap();
