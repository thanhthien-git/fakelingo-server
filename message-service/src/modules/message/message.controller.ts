import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Req,
  Query,
  Inject,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { SendMessageDto } from 'src/dtos/send-message.dto';
import { User } from 'src/decorators/user-request.decorator';
import { IUserRequest } from 'fakelingo-token';
import { GetConversationDto } from 'src/dtos/get-message.dto';

@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
  ) {}

  @Post('create')
  async sendMessage(@Body() data: SendMessageDto) {
    const message = await this.messageService.create(data);
    await this.messageService.notifyReceiver(message);
    return message;
  }

  @Get('conversation')
  async getConversation(@Query() query: GetConversationDto) {
    return await this.messageService.getConversationMessages(
      query.id,
      query.before,
      15,
    );
  }

  @Get()
  async getMessage(
    @Req() req: Request,
    @User() user: IUserRequest,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return await this.messageService.getMessageByUserId(
      user.userId,
      parseInt(page),
      parseInt(limit),
      req,
    );
  }
}
