import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/config';
import { TokenModule } from 'fakelingo-token';
import { PassportModule } from '@nestjs/passport';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    PassportModule.register({ session: true }),
    TokenModule.forRoot(process.env.SECRET_KEY),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    AuthModule,
  ],
})
export class AppModule {}
