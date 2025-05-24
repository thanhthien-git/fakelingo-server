import { Module, DynamicModule, Global } from "@nestjs/common";
import { CacheService } from "./caching.service";

@Global() 
@Module({})
export class CacheModule {
  static forRoot(redisUrl: string): DynamicModule {
    return {
      module: CacheModule,
      providers: [
        {
          provide: CacheService,
          useFactory: () => new CacheService(redisUrl),
        },
      ],
      exports: [CacheService],
    };
  }
}
