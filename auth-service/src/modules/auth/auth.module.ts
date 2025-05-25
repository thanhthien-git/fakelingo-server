import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from 'src/modules/auth/schema/user-schema';
import { HttpModule } from '@nestjs/axios';
import { TokenModule } from 'fakelingo-token';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    HttpModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
