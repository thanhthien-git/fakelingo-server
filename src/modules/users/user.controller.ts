import { Controller, Delete, Get, Patch } from '@nestjs/common';
import { User } from 'src/decorators/user-request.decorator';
import { IUserRequest } from 'src/interfaces/jwt-payload.interface';
import { UpdateProfileDto } from './dtos/update.dto';

@Controller('user')
export class UserController {
  @Get('profile')
  async myProfile(@User() u: IUserRequest) {
    return u.userId;
  }

  @Patch('update')
  async updateProfile(@User() u, dto: UpdateProfileDto) {}

  @Delete('delete')
  async deleteProfile(@User() u) {}
}
