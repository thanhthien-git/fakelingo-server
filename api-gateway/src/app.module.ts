import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { createRmqClients } from './create-rmq-client';
import { HttpModule } from '@nestjs/axios';
import { TokenModule } from 'fakelingo-token';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AuthController } from './apis/auth/auth.controller';
import { ProxyService } from './apis/proxy/proxy.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    TokenModule.forRoot(process.env.SECRET_KEY),
    ClientsModule.register(createRmqClients(process.env.RABBITMQ_URL)),
  ],
  controllers: [AuthController],
  providers: [ProxyService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
