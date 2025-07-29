import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from './schema/user-schema';
import { HttpModule } from '@nestjs/axios';
import { GoogleStrategy } from './strategy/google.strategy';
import { OAuth2Client } from 'google-auth-library';

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
  providers: [
    AuthService,
    GoogleStrategy,
    {
      provide: 'GOOGLE_OAUTH_CLIENT',
      useFactory: () => {
        return new OAuth2Client(process.env.GOOGLE_MOBILE_CLIENT_ID);
      },
    },
  ],
  controllers: [AuthController],
  exports: ['GOOGLE_OAUTH_CLIENT'], 
})
export class AuthModule {}
