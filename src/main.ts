import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomLogger } from 'src/modules/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(new CustomLogger("MAIN"));
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const port = process.env.PORT || 8000;

  const config = new DocumentBuilder()
    .setTitle('FakeLingo E-learning API')
    .setDescription('The FakeLingo API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, documentFactory);

  const logger = new Logger('MAIN');
  await app.listen(port, () => {
    logger.log(`server is running on port: ${port}`);
  });
}
bootstrap();
