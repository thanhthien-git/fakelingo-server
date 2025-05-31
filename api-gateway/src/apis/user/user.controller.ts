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
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProxyService } from '../proxy/proxy.service';
import { IUserRequest } from 'fakelingo-token';
import { User } from 'src/decorators/user-request.decorator';
import { UpdateProfileDto } from './dtos/update.dto';
import { ClientProxy, Payload } from '@nestjs/microservices';
import { CONFIG } from 'src/config/config';

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

  @Patch('profile')
  async updateProfile(
    @User() user: IUserRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    dto.userId = user.userId;
    return this.forwardToUserService('user/update', 'PATCH', dto);
  }

  @Patch('profile/photos')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) cb(null, true);
        else
          cb(new BadRequestException('Only image files are allowed!'), false);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updatePhotos(@UploadedFiles() files: Express.Multer.File[]) {
    return this.forwardToUserService(
      'user/update-photos',
      'PATCH',
      { files },
      { 'Content-Type': 'multipart/form-data' },
    );
  }

  @Delete()
  async deleteProfile(@User() user: IUserRequest) {
    return this.forwardToUserService(`user/delete/${user.userId}`, 'DELETE');
  }
}
