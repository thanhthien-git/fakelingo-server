import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UploadedFiles,
  UseInterceptors,
  BadGatewayException,
  Inject,
  BadRequestException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProxyService } from '../proxy/proxy.service';
import { IUserRequest } from 'fakelingo-token';
import { User } from 'src/decorators/user-request.decorator';
import { UpdateProfileDto } from './dtos/update.dto';
import { ClientProxy } from '@nestjs/microservices';
import { CONFIG } from 'src/config/config';
import { Request, Response } from 'express';
import { UpdateFcmTokenDto } from './dtos/update-fcm-token';

@Controller('user')
export class UserController {
  constructor(
    private readonly proxyService: ProxyService,
    @Inject(CONFIG.USER_SERVICE.service)
    private readonly userClient: ClientProxy,
  ) {}

  private async forwardToUserService<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    body?: any,
    headers?: any,
  ): Promise<T> {
    try {
      return await this.proxyService.forwardRequest(
        'USER',
        path,
        method,
        body,
        headers,
      );
    } catch (err) {
      console.error(`UserService error on ${method} ${path}:`, err);
      throw new BadGatewayException('User service request failed');
    }
  }

  @Get('my-profile')
  async getMyProfile() {
    return this.forwardToUserService('user/profile/me', 'GET');
  }

  @Get('profile/:id')
  async getProfileById(@Param('id') id: string) {
    return this.forwardToUserService(`user/profile/${id}`, 'GET');
  }

  @Patch('update')
  async updateProfile(@User() u: IUserRequest, @Body() dto: UpdateProfileDto) {
    dto.userId = u.userId;
    return this.forwardToUserService('user/update', 'PATCH', dto);
  }

  @Patch('update-photos')
  async updatePhotos(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forwardStreamRequest(
      'USER',
      'user/update-photos',
      req,
      res,
    );
  }

  @Delete()
  async deleteProfile(@User() user: IUserRequest) {
    return this.forwardToUserService(`user/delete/${user.userId}`, 'DELETE');
  }

  @Post('fcm-token')
  async updateFcmToken(@Body() dto: UpdateFcmTokenDto) {
    return this.proxyService.forwardRequest(
      'NOTI',
      'notifications/fcm-token',
      'POST',
      dto,
    );
  }
}
