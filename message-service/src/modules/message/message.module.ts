import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { HttpModule } from '@nestjs/axios';
import { MessageGateway } from 'src/gateway/message.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'src/schemas/message.schema';
import {
  Conversation,
  ConversationSchema,
} from 'src/schemas/conversation.schema';
import { MessageController } from './message.controller';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    RabbitMQModule,
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    HttpModule,
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway],
  exports: [MessageService],
})
export class MessageModule {}
