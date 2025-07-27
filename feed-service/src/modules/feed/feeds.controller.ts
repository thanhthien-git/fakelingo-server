import { Body, Controller, Post, Req } from '@nestjs/common';
import { FeedNewUserDto } from './dtos/get-list.dto';
import { FeedService } from './feeds.service';
import { User } from 'src/decorators/user-request.decorator';
import { IUserReq } from 'src/interfaces/user.request';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Post('get')
  async getFeed(@Body() dto: FeedNewUserDto, @User() u: IUserReq) {
    return await this.feedService.getNextFeed(u, dto);
  }
}
