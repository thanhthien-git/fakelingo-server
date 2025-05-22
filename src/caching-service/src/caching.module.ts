import { Module } from '@nestjs/common';
import { RedisClientProvider } from './caching.provider';
import { CachingService } from './caching.service';

@Module({
  imports: [],
  providers: [RedisClientProvider, CachingService],
  exports: [CachingService],
})
export class CachingModule {}
