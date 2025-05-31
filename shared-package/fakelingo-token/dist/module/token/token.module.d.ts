import { DynamicModule } from '@nestjs/common';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';
export declare class TokenModule {
    static forRoot(secret: string): DynamicModule;
    static forRootAsync(options: JwtModuleAsyncOptions): DynamicModule;
}
//# sourceMappingURL=token.module.d.ts.map