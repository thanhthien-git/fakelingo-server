import { ProxyService } from '../proxy/proxy.service';
import {
  BadGatewayException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { SendMessageDto } from './dtos/send_message.dto';
import { User } from 'src/decorators/user-request.decorator';
import { IUserRequest } from 'fakelingo-token';

@Controller('messages')
export class MessageController {
  constructor(private readonly proxyService: ProxyService) {}

  private async forWardToMessageService<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    body?: any,
    headers?: any,
  ): Promise<T> {
    try {
      return await this.proxyService.forwardRequest(
        'MESSAGE',
        path,
        method,
        body,
        headers,
      );
    } catch (err) {
      console.error(`Message Service error on ${method} ${path}:`, err);
      throw new BadGatewayException('Feed Service request failed');
    }
  }

  @Post('create')
  async sendMessage(@Body() dto: SendMessageDto) {
    return await this.forWardToMessageService('messages/create', 'POST', dto);
  }

  @Get()
  async getMessage(@User() u: IUserRequest) {
    return await this.forWardToMessageService('messages/get', 'GET', {
      userId: u.userId,
    });
  }
}
