import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    console.log(
      `\x1b[32m[${method}]\x1b[0m \x1b[36m[${originalUrl}]\x1b[0m - \x1b[33m[${ip}]\x1b[0m - \x1b[90m[${userAgent}]\x1b[0m`,
    );
    next();
  }
}
