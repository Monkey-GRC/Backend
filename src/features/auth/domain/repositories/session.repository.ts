import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { Session } from '../entities/session.entity';

export type NewSession = {
  userId: string;
  refreshTokenHash: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
};

export abstract class SessionRepository {
  // `audit` se escribe en la misma transacción que la sesión (SEG-36). `null` solo cuando otra acción ya audita este
  // mismo hecho (el canje de la clave).
  abstract create(scope: TenantScope, data: NewSession, audit: AuditIntent<Session> | null): Promise<Session>;

  // Búsqueda previa al tenant: el refresh llega solo con el token.
  abstract findByRefreshTokenHash(hash: string): Promise<Session | null>;

  abstract findById(scope: TenantScope, sessionId: string): Promise<Session | null>;

  // Refresh: rota el token (el anterior deja de servir) y marca actividad.
  abstract rotate(scope: TenantScope, sessionId: string, newHash: string, at: Date): Promise<void>;

  abstract touch(scope: TenantScope, sessionId: string, at: Date): Promise<void>;

  // Cierra la sesión y escribe `audit` en la misma transacción. Solo audita si de verdad la cerró (idempotente).
  // `null` en los cierres automáticos del sistema (inactividad, expiración, usuario inactivo): no son una acción del
  // usuario y hoy no se registran; si el comité pide registrarlos (CC7.2), se pasa una intención aquí.
  abstract revoke(scope: TenantScope, sessionId: string, at: Date, audit: AuditIntent<Session> | null): Promise<void>;
}
