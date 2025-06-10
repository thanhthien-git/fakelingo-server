import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { IUserRequest, TokenService } from 'fakelingo-token';

@Injectable()
export class GlobalMiddleware implements NestMiddleware {
  constructor(private tokenService: TokenService) {}

  async use(req: any, res: any, next: () => void) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const ip = req.ip || req.connection?.remoteAddress || 'unknown ip';
      const method = req.method;
      const originalUrl = req.originalUrl || req.url;
      console.log(
        `[NOTIFICATION SERVICE - Middleware] ${method} ${originalUrl} - IP: ${ip}`,
      );
      if (!token) {
        throw new UnauthorizedException(`No token provided`);
      }

      const decoded: IUserRequest = await this.tokenService.verifyToken(token);

      req.user = decoded;

      next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
