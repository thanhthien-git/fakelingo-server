import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserRequest } from '../interfaces/jwt-payload.interface';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as IUserRequest;
  },
);
