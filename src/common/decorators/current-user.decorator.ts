import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Principal } from '../auth/principal';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Principal =>
    ctx.switchToHttp().getRequest<{ principal: Principal }>().principal,
);
