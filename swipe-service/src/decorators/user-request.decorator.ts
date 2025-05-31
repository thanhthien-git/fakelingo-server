import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // HTTP context
    if (ctx.getType() === 'http') {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
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
