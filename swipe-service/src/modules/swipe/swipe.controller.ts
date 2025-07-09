import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SwipeDto } from './dto/swipe-dto';
import { SwipeService } from './swipe.service';
import { User } from 'src/decorators/user-request.decorator';
import { IUserRequest } from 'fakelingo-token';

@Controller('swipe')
export class SwipeController {
  constructor(private swipeService: SwipeService) {}

  @Post('action')
  async swipe(@Body() body: SwipeDto, @User() user: IUserRequest) {
    console.log(body);
    return await this.swipeService.handleSwipe(user.userId, body);
  }

  @Get('unread')
  async getUnreadSwipe(
    @User() user: IUserRequest,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return await this.swipeService.getUnreadSwipe(user.userId);
  }
}
