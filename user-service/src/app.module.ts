import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserModule } from './modules/users/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@fakelingo/cache-lib';
import { TokenModule } from 'fakelingo-token';
import { GlobalMiddleware } from './middleware/global.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    CacheModule.forRoot(process.env.REDIS_URL),
    UserModule,
    TokenModule.forRoot(process.env.SECRET_KEY),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GlobalMiddleware)
      .exclude(
        { path: 'user/create', method: RequestMethod.POST },
        { path: 'user/validate-user', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
