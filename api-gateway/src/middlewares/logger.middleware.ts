import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
//   private readonly logger = new CustomLogger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    // this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);
    console.log((`${method} ${originalUrl} - ${ip} - ${userAgent}`));
    next();
  }
}
