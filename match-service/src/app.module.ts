import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MatchModule } from './modules/match/match.module';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    MatchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
