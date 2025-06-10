import { ProxyService } from '../proxy/proxy.service';
import {
  BadGatewayException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { User } from 'src/decorators/user-request.decorator';
import { IUserRequest } from 'fakelingo-token';
import { SwipeDto } from './dtos/swipe-dto';

@Controller('swipe')
export class SwipeController {
  constructor(private readonly proxyService: ProxyService) {}

  private async forWardToSwipeService<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    body?: any,
    headers?: any,
  ): Promise<T> {
    try {
      return await this.proxyService.forwardRequest(
        'SWIPE',
        path,
        method,
        body,
        headers,
      );
    } catch (err) {
      console.error(`SWIPE Service error on ${method} ${path}:`, err);
      throw new BadGatewayException('SWIPE Service request failed');
    }
  }

  @Post('action')
  async swipe(@Body() dto: SwipeDto) {
    return await this.forWardToSwipeService('swipe/action', 'POST', dto);
  }

  @Get('unread')
  async getUnread() {
    return await this.forWardToSwipeService('swipe/unread', 'GET');
  }
}
