import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';

@Global()
@Module({})
export class TokenModule {
  static forRoot(secretKey: string): DynamicModule {
    if (!secretKey) {
      throw new Error('Secret Key must be provided');
    }

    return {
      module: TokenModule,
      imports: [
        JwtModule.register({
          secret: secretKey,
          signOptions: { expiresIn: '100h' },
        }),
      ],
      providers: [TokenService],
      exports: [TokenService],
    };
  }
}
