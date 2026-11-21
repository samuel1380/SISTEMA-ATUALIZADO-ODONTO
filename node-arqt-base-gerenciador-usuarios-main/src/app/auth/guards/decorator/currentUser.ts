import { createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: string, req) => {
  return {
    user: req?.args[0]?.user,
    application: req?.args[0]?.headers?.application
  }
});
