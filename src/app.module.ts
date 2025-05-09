import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { TokenModule } from './modules/token/token/token.module';
import { DatabaseModule } from './modules/database/database/database.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, TokenModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
