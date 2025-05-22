import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '../../schemas/user-schema';
import { CachingModule } from '../../caching-service/src/caching.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    CachingModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
