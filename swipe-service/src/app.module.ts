import { Module } from '@nestjs/common';
import { SwipeModule } from './modules/swipe/swipe.module';

@Module({
  imports: [SwipeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
