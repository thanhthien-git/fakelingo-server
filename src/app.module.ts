import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module.ts';
import { TokenModule } from './modules/token/token.module.ts';
import { CachingModule } from './modules/caching/caching.module.ts';
import { DatabaseModule } from './modules/database/database/database.module.ts';
import { CustomLogger } from './modules/logger/logger.service.ts';
import { JwtMiddleware } from './middlewares/auth.middleware.ts';
import { LoggerMiddleware } from './middlewares/logger.middleware.ts';



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
