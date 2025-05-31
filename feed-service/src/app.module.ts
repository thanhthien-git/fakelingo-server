import { CacheModule } from '@fakelingo/cache-lib';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FeedModule } from './modules/feed/feeds.modules';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalMiddleware } from './middleware/global.middleware';
import { TokenModule } from 'fakelingo-token';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.forRoot(process.env.REDIS_URL),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    TokenModule.forRoot(process.env.SECRET_KEY),
    FeedModule,
  ],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GlobalMiddleware).forRoutes('*')
  }
}
