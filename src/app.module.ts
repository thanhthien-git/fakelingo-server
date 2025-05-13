import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { TokenModule } from './modules/token/token/token.module';
import { DatabaseModule } from './modules/database/database/database.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { CustomLogger } from './modules/logger/logger.service';
import { JwtMiddleware } from './middlewares/auth.middleware';
import { CachingModule } from './modules/caching/caching.module';

const PROTECTED_ROUTES = ['user'];
@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    TokenModule,
    DatabaseModule,
    CachingModule,
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
