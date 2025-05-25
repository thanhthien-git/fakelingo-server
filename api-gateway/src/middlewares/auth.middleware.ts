import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from 'fakelingo-token';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private tokenService: TokenService) {}

  async use(req: any, res: any, next: () => void) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = await this.tokenService.verifyToken(token);
      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }

      req.user = payload;

      req.forwardHeaders = {
        authorization: authHeader,
        'x-request-id': req.headers['x-request-id'],
      };

      next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
