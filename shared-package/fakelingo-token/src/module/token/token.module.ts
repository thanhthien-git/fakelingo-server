import { DynamicModule, Global, Module } from '@nestjs/common';
import {
  JwtModule,
  JwtModuleAsyncOptions,
  JwtModuleOptions,
} from '@nestjs/jwt';
import { TokenService } from './token.service';

@Global()
@Module({})
export class TokenModule {
  static forRoot(secret: string): DynamicModule {
    if (!secret) {
      throw new Error('Secret Key must be provided');
    }

    const jwtModule = JwtModule.register({
      secret,
      signOptions: { expiresIn: '100h' },
    });

    return {
      module: TokenModule,
      imports: [jwtModule],
      providers: [TokenService],
      exports: [TokenService, jwtModule], 
    };
  }

  static forRootAsync(options: JwtModuleAsyncOptions): DynamicModule {
    const jwtModule = JwtModule.registerAsync({
      imports: options.imports,
      useFactory: async (...args) => {
        const config = await options.useFactory!(...args);
        return {
          ...config,
          signOptions: config.signOptions ?? { expiresIn: '100h' },
        } as JwtModuleOptions;
      },
      inject: options.inject || [],
    });

    return {
      module: TokenModule,
      imports: [jwtModule],
      providers: [TokenService],
      exports: [TokenService, jwtModule],
    };
  }
}