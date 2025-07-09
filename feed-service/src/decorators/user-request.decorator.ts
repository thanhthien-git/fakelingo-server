import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserReq } from 'src/interfaces/user.request';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // HTTP context
    if (ctx.getType() === 'http') {
      const request = ctx.switchToHttp().getRequest();
      const token = String(request.headers['authorization'])
      const user = request.user;

      const userRequest: IUserReq = {
        ...user,
        token: token,
      };
      return userRequest;
    }

    // RabbitMQ context
    if (ctx.getType() === 'rpc') {
      const rpcContext = ctx.switchToRpc();
      const data = rpcContext.getData();
      return data.user;
    }

    return null;
  },
);
