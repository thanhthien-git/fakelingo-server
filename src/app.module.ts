import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TokenModule } from './modules/token/token.module';
import { DatabaseModule } from './modules/database/database/database.module';
import { CustomLogger } from './logger-service/logger.service';
import { JwtMiddleware } from './middlewares/auth.middleware';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { FeedModule } from './feed-service/feeds.modules';
import { UserModule } from './user-service/user.module';
import { CachingModule } from './caching-service/src/caching.module';
import { AuthModule } from './auth-services/src/auth.module';

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
