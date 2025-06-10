import { Controller, Post, Body } from '@nestjs/common';
import { MessageService } from './message.service';
import { SendMessageDto } from 'src/dtos/send-message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async sendMessage(@Body() data: SendMessageDto) {
    const message = await this.messageService.create(data);
    await this.messageService.notifyReceiver(message);
    return message;
  }
}
