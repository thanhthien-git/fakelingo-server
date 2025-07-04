import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenModule } from 'fakelingo-token';
import { GlobalMiddleware } from './middleware/global.middleware';
import { ConfigModule } from '@nestjs/config';
import { MessageModule } from './modules/message/message.module';
import { CONFIG } from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(CONFIG.mongoDb),
    TokenModule.forRoot(CONFIG.secretKey),
    MessageModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GlobalMiddleware).forRoutes('*');
  }
}
