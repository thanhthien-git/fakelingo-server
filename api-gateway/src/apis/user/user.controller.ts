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
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProxyService } from '../proxy/proxy.service';
import { IUserRequest } from 'fakelingo-token';
import { User } from 'src/decorators/user-request.decorator';
import { UpdateProfileDto } from './dtos/update.dto';

@Controller('user')
export class UserController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('profile')
  async getMyProfile(@User() user: IUserRequest) {
    try {
      return await this.proxyService.forwardRequest(
        'USER',
        `user/profile/${user.userId}`,
        'GET',
      );
    } catch (err) {
      throw new BadGatewayException(err.message);
    }
  }

  @Get('profile/:id')
  async getProfileById(@Param('id') id: string) {
    try {
      return await this.proxyService.forwardRequest(
        'USER',
        `user/profile/${id}`,
        'GET',
      );
    } catch (err) {
      throw new BadGatewayException(err.message);
    }
  }

  @Patch('update')
  async updateProfile(
    @User() user: IUserRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    try {
      dto.userId = user.userId;
      return await this.proxyService.forwardRequest(
        'USER',
        'user/update',
        'PATCH',
        dto,
      );
    } catch (err) {
      throw new BadGatewayException(err.message);
    }
  }

  @Patch('update-photos')
  @UseInterceptors(FilesInterceptor('files', 10))
  async updatePhotos(@UploadedFiles() files: Express.Multer.File[]) {
    try {
      return await this.proxyService.forwardRequest(
        'USER',
        'user/update-photos',
        'PATCH',
        { files },
        { 'Content-Type': 'multipart/form-data' },
      );
    } catch (err) {
      throw new BadGatewayException(err.message);
    }
  }

  @Delete('delete')
  async deleteProfile(@User() user: IUserRequest) {
    try {
      return await this.proxyService.forwardRequest(
        'USER',
        `user/delete/${user.userId}`,
        'DELETE',
      );
    } catch (err) {
      throw new BadGatewayException(err.message);
    }
  }
}
