import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interfaces/jwt-payload.interface';
import { ITokenPayload } from './dto/generate-token.dto';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {
    console.log('JwtService in TokenService:', this.jwtService);
  }
  async verifyToken(token: string): Promise<TokenPayload | null> {
    if (!token) return null;
    const result = await this.jwtService.verify(token);
    return result as TokenPayload;
  }

  async generateToken(dto: ITokenPayload): Promise<string> {
    const payload: TokenPayload = { ...dto };
    return this.jwtService.sign(payload, {
      expiresIn: '100h',
    });
  }
}
