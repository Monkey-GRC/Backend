import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { Principal } from '../auth/principal';
import { DomainError } from '../errors/domain-error';
import { SlidingWindowLimiter } from './sliding-window-limiter';

const WINDOW_MS = 60_000;
// §5.3 · 100 peticiones por minuto por usuario y 1000 por empresa.
const DEFAULT_USER_PER_MINUTE = 100;
const DEFAULT_COMPANY_PER_MINUTE = 1000;

const positiveInt = (config: ConfigService, key: string, fallback: number): number => {
  const raw = config.get<string>(key)?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${key} debe ser un entero > 0`);
  return value;
};

// SEG-19 · Límite de peticiones sobre la SESIÓN: 100/min por usuario y 1000/min por empresa. Corre después de SessionAuthGuard y RolesGuard, así que solo ve peticiones ya
// autenticadas; las rutas públicas (login, recuperación, el trabajador interno) no pasan por aquí: sin sesión no hay a quién contárselo, y limitar por dirección exige
// saber la IP real detrás del proxy (DT-37).
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly perUser: SlidingWindowLimiter;
  private readonly perCompany: SlidingWindowLimiter;

  constructor(config: ConfigService) {
    this.perUser = new SlidingWindowLimiter(positiveInt(config, 'RATE_LIMIT_USER_PER_MINUTE', DEFAULT_USER_PER_MINUTE), WINDOW_MS);
    this.perCompany = new SlidingWindowLimiter(positiveInt(config, 'RATE_LIMIT_COMPANY_PER_MINUTE', DEFAULT_COMPANY_PER_MINUTE), WINDOW_MS);
  }

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const principal = http.getRequest<{ principal?: Principal }>().principal;
    if (!principal) return true;

    const now = Date.now();
    const user = this.perUser.check(principal.userId, now);
    const company = this.perCompany.check(principal.companyId, now);
    if (user.allowed && company.allowed) {
      // Se cuentan en los dos topes a la vez, y solo si pasó por los dos: una petición rechazada no gasta cupo de nadie.
      this.perUser.record(principal.userId, now);
      this.perCompany.record(principal.companyId, now);
      return true;
    }

    const waitMs = Math.max(user.allowed ? 0 : user.retryAfterMs, company.allowed ? 0 : company.retryAfterMs);
    const retryAfterSeconds = Math.ceil(waitMs / 1000);
    http.getResponse<Response>().setHeader('Retry-After', String(retryAfterSeconds));
    throw new DomainError('RATE_LIMITED', { retry_after_seconds: retryAfterSeconds });
  }
}
