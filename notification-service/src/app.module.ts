import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenModule } from 'fakelingo-token';
import { GlobalMiddleware } from './middleware/global.middleware';
import { NotificationModule } from './modules/notification/notification.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@fakelingo/cache-lib';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    TokenModule.forRoot(process.env.SECRET_KEY),
    CacheModule.forRoot(process.env.REDIS_URL),
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GlobalMiddleware).forRoutes('*');
  }
}
