import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateProfileDto } from './dtos/update.dto';
import { UserService } from './user.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RegisterDto } from './dtos/register.dto';
import { IUserRequest } from 'src/interfaces/jwt-payload.interface';
import { User } from 'src/decorators/user-request.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  async createUser(@Body() dto: RegisterDto) {
    return await this.userService.createUser(dto);
  }
  @Get('profile')
  async getMyProfile(@User() u: IUserRequest) {
    const { userId } = u;
    return await this.userService.getProfileById(userId);
  }

  @Get('profile')
  async getProfileById(@Param('id') id: string) {
    return await this.userService.getProfileById(id);
  }

  @Patch('update')
  async updateProfile(@User() u, dto: UpdateProfileDto) {
    dto.userId = u.userId;
    return await this.userService.updateProfile(dto);
  }

  @Patch('update-photos')
  @UseInterceptors(FilesInterceptor('files', 10))
  async updatePhotos(@User() u, @UploadedFiles() files: Express.Multer.File[]) {
    const { userId } = u;
    return await this.userService.updatePhotos(files, userId);
  }

  @Delete('delete')
  async deleteProfile(@User() u) {
    const { userId } = u;
    return await this.userService.deleteAccount(userId);
  }
}
