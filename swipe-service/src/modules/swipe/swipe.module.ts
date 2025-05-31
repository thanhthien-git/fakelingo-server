import { Module } from '@nestjs/common';
import { SwipeController } from './swipe.controller';
import { SwipeService } from './swipe.service';

@Module({
  imports: [],
  controllers: [SwipeController],
  providers: [SwipeService],
})
export class SwipeModule {}
