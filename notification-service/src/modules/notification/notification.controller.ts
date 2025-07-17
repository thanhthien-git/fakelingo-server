import { Controller, Patch, Param, Post, Get, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { User } from 'src/decorators/user-request.decorator';
import { IUserRequest } from 'fakelingo-token';
import { UpdateFcmTokenDto } from './dtos/update-fcm-token';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationPayloadDto } from './dtos/send-notification-payload';
import { SendMatchedNotiDto } from './dtos/matched-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('notification_message')
  async handleMessageSent(@Payload() data: NotificationPayloadDto) {
    await this.notificationService.sendNotification(data)
  }

  @EventPattern('notification_matched')
  async sendMatchedNotification(@Payload() data: SendMatchedNotiDto) {
    await this.notificationService.sendMatchedNotification(data)
  }

  @Get('get')
  async getNotification(@User() user: IUserRequest) {
    return this.notificationService.getNofitication(user.userId);
  }

  @Post('fcm-token')
  async updateFcmToken(
    @User() u: IUserRequest,
    @Body() dto: UpdateFcmTokenDto,
  ) {
    return this.notificationService.updateFcmToken(u.userId, dto);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}
