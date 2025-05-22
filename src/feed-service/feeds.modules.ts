import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user-schema';
import { CachingModule } from '../caching-service/src/caching.module';
import { FeedController } from './feeds.controller';
import { Swipe, SwipeSchema } from 'src/schemas/swipe-schema';
import { UserModule } from '../modules/users/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Swipe.name, schema: SwipeSchema },
    ]),
    CachingModule,
    UserModule,
  ],
  controllers: [FeedController],
  exports: [],
})
export class FeedModule {}
