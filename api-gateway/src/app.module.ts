import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { AuthController } from './apis/auth/auth.controller';
import { createRmqClients } from './create-rmq-client';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    ClientsModule.register(createRmqClients(process.env.RABBITMQ_URL)),
  ],
  controllers: [AuthController],
})
export class AppModule {}
