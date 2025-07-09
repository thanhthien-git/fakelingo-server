import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SwipeModule } from './modules/swipe/swipe.module';
import { ConfigModule } from '@nestjs/config';
import { TokenModule } from 'fakelingo-token';
import { GlobalMiddleware } from './middlewares/global.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@fakelingo/cache-lib';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SwipeModule,
    CacheModule.forRoot(process.env.REDIS_URL),
    TokenModule.forRoot(process.env.SECRET_KEY),
    MongooseModule.forRoot(process.env.MONGODB_URL)
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GlobalMiddleware).forRoutes('*');
  }
}
