import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserRequest } from 'fakelingo-token';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as IUserRequest;
  },
);
