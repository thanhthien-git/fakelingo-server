import { Module } from '@nestjs/common';
import { SwipeController } from './swipe.controller';
import { SwipeService } from './swipe.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Swipe, SwipeSchema } from 'src/schema/swipe.schema';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Swipe.name, schema: SwipeSchema }]),
    HttpModule,
    RabbitMQModule,
  ],
  controllers: [SwipeController],
  providers: [SwipeService],
})
export class SwipeModule {}
