import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SwipeModule } from './modules/swipe/swipe.module';
import { ConfigModule } from '@nestjs/config';
import { TokenModule } from 'fakelingo-token';
import { GlobalMiddleware } from './middlewares/global.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SwipeModule,
    TokenModule.forRoot(process.env.SECRET_KEY),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GlobalMiddleware).forRoutes('*');
  }
}
