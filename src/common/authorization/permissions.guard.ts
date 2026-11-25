import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Principal } from '../auth/principal';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { DomainError } from '../errors/domain-error';
import { ANY_AUTHENTICATED_KEY, PERMISSION_KEY } from './can.decorator';
import { can, type Permission } from './permission-matrix';

// SEG-86 · Corre después de SessionAuthGuard: el rol viene de la base (no del frontend ni solo del JWT). NIEGA POR DEFECTO: sin `@Can`, `@Public` ni `@AnyAuthenticated`, 403.
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, targets)) return true;

    const principal = context.switchToHttp().getRequest<{ principal?: Principal }>().principal;
    if (!principal) throw new DomainError('FORBIDDEN');

    // Manda lo más específico: lo declarado en el método gana sobre lo de la clase (un `@Can` de método sobre un `@AnyAuthenticated` de clase exige el permiso, y a la inversa).
    // En un mismo nivel, `@Can` gana a `@AnyAuthenticated` (lo más estricto).
    const rule = this.ruleAt(context.getHandler()) ?? this.ruleAt(context.getClass());
    if (rule === 'any') return true;
    if (!rule || !can(rule, principal.role)) throw new DomainError('FORBIDDEN');
    return true;
  }

  private ruleAt(target: Parameters<Reflector['get']>[1]): Permission | 'any' | undefined {
    const permission = this.reflector.get<Permission | undefined>(PERMISSION_KEY, target);
    if (permission) return permission;
    return this.reflector.get<boolean | undefined>(ANY_AUTHENTICATED_KEY, target) ? 'any' : undefined;
  }
}
