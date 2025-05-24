import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@fakelingo/cache-lib';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    CacheModule.forRoot(process.env.REDIS_URL),
    UserModule,
  ],
})
export class AppModule {}
