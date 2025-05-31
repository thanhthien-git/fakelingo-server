import { CONFIG } from 'src/config/config';
import { ProxyService } from '../proxy/proxy.service';
import {
  BadGatewayException,
  Body,
  Controller,
  Inject,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FeedNewUserDto } from '../user/dtos/feed-new-user.dto';

@Controller('feed')
export class FeedController {
  constructor(
    private readonly proxyService: ProxyService,
    @Inject(CONFIG.FEED_SERVICE.service)
    private readonly feedClient: ClientProxy,
  ) {}

  private async forwardToFeedService<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    body?: any,
    headers?: any,
  ): Promise<T> {
    try {
      return await this.proxyService.forwardRequest(
        'FEED',
        path,
        method,
        body,
        headers,
      );
    } catch (err) {
      console.error(`Feed Service error on ${method} ${path}:`, err);
      throw new BadGatewayException('Feed Service request failed');
    }
  }

  @Post('get')
  async get(@Body() dto: FeedNewUserDto) {
    return await this.forwardToFeedService('feed/get', 'POST', dto);
  }
}
