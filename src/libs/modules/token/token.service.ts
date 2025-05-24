import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from '../../interfaces/jwt-payload.interface';
import { CreateTokenDto } from './dto/generate-token.dto';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async verifyToken(token: string): Promise<TokenPayload> {
    if (!token) return null;
    const result = await this.jwtService.verify(token);
    return result as TokenPayload;
  }

  async generateToken(dto: CreateTokenDto): Promise<string> {
    const payload: TokenPayload = { ...dto };

    return this.jwtService.signAsync(payload, {
      expiresIn: '100h',
    });
  }
}
