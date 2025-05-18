import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { TokenModule } from './modules/token/token.module';
import { CachingModule } from './modules/caching/caching.module';
import { DatabaseModule } from './modules/database/database/database.module';
import { CustomLogger } from './modules/logger/logger.service';
import { JwtMiddleware } from './middlewares/auth.middleware';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { FeedModule } from './modules/feeds/feeds.modules';
import { UserModule } from './modules/users/user.module';

const PROTECTED_ROUTES = ['user', 'feeds'];
@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    TokenModule,
    DatabaseModule,
    CachingModule,
    UserModule,
    FeedModule,
  ],
  controllers: [],
  providers: [CustomLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer.apply(JwtMiddleware).forRoutes(...PROTECTED_ROUTES);
  }
}
