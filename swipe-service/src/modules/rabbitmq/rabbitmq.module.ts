import { Module } from '@nestjs/common';
import { RabbitMQProviders } from './rabbitmq.provider';
@Module({
  providers: [...RabbitMQProviders],
  exports: [...RabbitMQProviders],
})
export class RabbitMQModule {}
