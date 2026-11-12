import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Principal } from '../../../../common/auth/principal';
import { IS_PUBLIC_KEY } from '../../../../common/decorators/public.decorator';
import { ValidateSessionUseCase } from '../../application/use-cases/session/validate-session.use-case';
import { readAccessCookie } from '../auth-cookies';

// Guard global: todo endpoint exige sesión válida salvo los marcados con @Public().
@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly validateSession: ValidateSessionUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request & { principal?: Principal }>();
    req.principal = await this.validateSession.execute(readAccessCookie(req));
    return true;
  }
}
