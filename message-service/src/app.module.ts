import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenModule } from 'fakelingo-token';
import { GlobalMiddleware } from './middleware/global.middleware';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URL),
    TokenModule.forRoot(process.env.JWT_SECRET),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GlobalMiddleware).forRoutes('*');
  }
}
