import { DynamicModule } from "@nestjs/common";
export declare class CacheModule {
    static forRoot(redisUrl: string): DynamicModule;
}
