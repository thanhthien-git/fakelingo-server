import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../..user-schema';
import { CachingModule } from '../caching/caching.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CachingModule,
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
