import { Controller, Patch, Param, Post, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { User } from 'src/decorators/user-request.decorator';
import { IUserRequest } from 'fakelingo-token';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('get')
  async getNotification(@User() user: IUserRequest) {
    return this.notificationService.getNofitication(user.userId);
  }
  
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}
