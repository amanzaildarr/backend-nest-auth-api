import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Create a custom parameter decorator called CurrentUser
export const CurrentUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    // Extract the request object from the execution context
    const request = ctx.switchToHttp().getRequest();

    // Return the 'user' property from the request object
    return request.user;
  },
);
