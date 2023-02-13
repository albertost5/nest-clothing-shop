import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetRawHeaders = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const rawHeaders = request.rawHeaders;

    return rawHeaders;
  },
);
