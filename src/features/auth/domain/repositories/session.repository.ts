import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { Session, SessionOwner } from '../entities/session.entity';
import type { DeviceEffect, DeviceForget } from './trusted-device.repository';

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
  // `device` (D123) recuerda o anota el dispositivo en esa misma transacción.
  abstract create(scope: TenantScope, data: NewSession, audit: AuditIntent<Session> | null, device?: DeviceEffect): Promise<Session>;

  // Búsqueda previa al tenant: el refresh llega solo con el token.
  abstract findByRefreshTokenHash(hash: string): Promise<Session | null>;

  abstract findById(scope: TenantScope, sessionId: string): Promise<Session | null>;

  // Sesión y su dueña en una sola consulta (validación de cada petición). `owner` es null si la persona no es visible o no existe.
  abstract findWithOwner(scope: TenantScope, sessionId: string): Promise<{ session: Session; owner: SessionOwner | null } | null>;

  // Refresh: rota el token (el anterior deja de servir) y marca actividad.
  abstract rotate(scope: TenantScope, sessionId: string, newHash: string, at: Date): Promise<void>;

  abstract touch(scope: TenantScope, sessionId: string, at: Date): Promise<void>;

  // Cierra la sesión y escribe `audit` en la misma transacción. Solo audita si de verdad la cerró (idempotente).
  // `null` en los cierres automáticos del sistema (inactividad, expiración, usuario inactivo): no son una acción del
  // usuario y hoy no se registran; si el comité pide registrarlos (CC7.2), se pasa una intención aquí.
  // `forget` (D123, logout) revoca además el dispositivo recordado de la cookie, si es de esta persona, con su rastro.
  abstract revoke(scope: TenantScope, sessionId: string, at: Date, audit: AuditIntent<Session> | null, forget?: DeviceForget): Promise<void>;
}
