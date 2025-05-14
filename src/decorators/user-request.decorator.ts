import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserRequest } from '../interfaces/jwt-payload.interface';

export const User = createParamDecorator(
  (data: any, ctx: ExecutionContext): IUserRequest => {
    const request = ctx.switchToHttp().getRequest();
    return request.auth as IUserRequest;
  },
);
