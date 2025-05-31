import { Body, Controller, Post } from '@nestjs/common';
import { FeedNewUserDto } from './dtos/get-list.dto';
import { FeedService } from './feeds.service';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Post('get')
  async getFeed(@Body() dto: FeedNewUserDto) {
    return await this.feedService.getNextFeed('6826fefad6902dfcebee5e24', dto);
  }
}
