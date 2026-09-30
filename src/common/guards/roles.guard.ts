import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Principal } from '../auth/principal';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { DomainError } from '../errors/domain-error';

// Corre después de SessionAuthGuard: el rol viene de la base (no del frontend ni solo del JWT).
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const principal = context.switchToHttp().getRequest<{ principal?: Principal }>().principal;
    if (!principal || !roles.includes(principal.role)) throw new DomainError('FORBIDDEN');
    return true;
  }
}
