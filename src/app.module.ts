import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/modules/auth/auth.module';
import { TokenModule } from 'src/modules/token/token.module';
import { CachingModule } from 'src/modules/caching/caching.module';
import { DatabaseModule } from 'src/modules/database/database/database.module';
import { CustomLogger } from 'src/modules/logger/logger.service';
import { JwtMiddleware } from 'src/middlewares/auth.middleware';
import { LoggerMiddleware } from 'src/middlewares/logger.middleware';


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
