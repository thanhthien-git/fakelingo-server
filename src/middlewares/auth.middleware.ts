import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { TokenService } from 'src/modules/token/token.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private tokenService: TokenService) {}

  async use(req: any, res: any, next: () => void) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = await this.tokenService.verifyToken(token);
      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }

      req.user = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
