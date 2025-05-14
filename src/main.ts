import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomLogger } from './modules/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(new CustomLogger("MAIN"));
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('FakeLingo API')
    .setDescription('The FakeLingo API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const logger = new CustomLogger('MAIN');
  await app.listen(process.env.PORT || 8000, () => {
    logger.log(`server is running on port: ${process.env.PORT || 8000}`);
  });
}
bootstrap();
