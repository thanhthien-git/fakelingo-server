import { Controller, Post, Body, Get, Patch } from '@nestjs/common';
import { MessageService } from './message.service';
import { SendMessageDto } from 'src/dtos/send-message.dto';
import { User } from 'src/decorators/user-request.decorator';
import { IUserRequest } from 'fakelingo-token';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('create')
  async sendMessage(@Body() data: SendMessageDto) {
    const message = await this.messageService.create(data);
    await this.messageService.notifyReceiver(message);
    return message;
  }

  @Get()
  async getMessage(@User() user: IUserRequest) {
    return await this.messageService.getMessageByUserId(user.userId);
  }
}
