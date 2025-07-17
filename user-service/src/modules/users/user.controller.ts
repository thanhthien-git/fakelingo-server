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
import { LoginDto } from './dtos/login.dto';
import { FeedNewUserDto } from './dtos/feed-new-user.dto';
import { GetUserByIdsDto } from './dtos/get-by-ids.dto';
import { UpdateFcmTokenDto } from './dtos/update-fcm-token';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  async createUser(@Body() dto: RegisterDto) {
    return await this.userService.createUser(dto);
  }

  @Post('fcm-token')
  async updateFcmtoken(
    @Body() dto: UpdateFcmTokenDto,
    @User() u: IUserRequest,
  ) {
    return await this.userService.updateUserFcmToken(dto, u.userId);
  }

  @Post('get-by-ids')
  async getUserByIds(@Body() dto: GetUserByIdsDto) {
    const { ids } = dto;
    console.log(ids);
    return await this.userService.getUserByIds(ids);
  }

  @Post('validate-user')
  async validateUser(@Body() dto: LoginDto) {
    return await this.userService.validateUser(dto);
  }

  @Get('profile/me')
  async getMyProfile(@User() u: IUserRequest) {
    const { userId } = u;
    return await this.userService.getProfileById(userId);
  }

  @Get('profile/:id')
  async getProfileById(@Param('id') id: string) {
    return await this.userService.getProfileById(id);
  }

  @Patch('update')
  async updateProfile(@Body() dto: UpdateProfileDto) {
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

  @Post('find-by-condition')
  async findByCondition(@User() u, @Body() dto: FeedNewUserDto) {
    const { userId } = u;
    return await this.userService.findUserByCondition(dto, 10, userId);
  }
}
