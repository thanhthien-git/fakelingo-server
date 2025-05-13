import { NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { TokenService } from 'src/modules/token/token/token.service';

export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  async use(req: any, res: any, next: (error?: any) => void) {
    const authorizationHeader = this.getAuthorizationHeader(req);
    if (!authorizationHeader) {
      throw new UnauthorizedException('Token is not valid');
    }
    const token = authorizationHeader.startsWith('Bearer ')
      ? authorizationHeader.slice(7)
      : authorizationHeader;

    const decoded = await this.tokenService.verifyToken(token);
    if (!decoded) {
      throw new UnauthorizedException('Token is not valid');
    }

    const { userName, userId, role } = decoded;
    req.auth = { userName, userId, role };
    next();
  }

  private getAuthorizationHeader(req: Request): string | null {
    return req.headers['authorization'] || req.headers['Authorization'] || null;
  }
}
