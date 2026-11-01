import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PasswordResetToken } from '../entities/password-reset-token.entity';

export type PasswordChange = {
  userId: string;
  // La contraseña que se deja: pasa al historial.
  previousHash: string;
  newHash: string;
  at: Date;
  // La sesión desde la que se cambia (se conserva); `null` cierra todas, como en la recuperación.
  keepSessionId: string | null;
  // El enlace de recuperación que se gasta junto con el cambio; `null` en el cambio voluntario.
  resetTokenId: string | null;
};

// Todo lo de la contraseña que toca la base (D101). El cambio escribe la contraseña nueva, el historial, el cierre de sesiones, el gasto del enlace y su rastro
// en una sola transacción (SEG-36).
export abstract class PasswordRepository {
  // Las contraseñas anteriores más recientes (solo hashes), de la más nueva a la más vieja.
  abstract recentHashes(scope: TenantScope, userId: string, limit: number): Promise<string[]>;

  // Cuántas contraseñas se cambiaron desde `since`.
  abstract countChangesSince(scope: TenantScope, userId: string, since: Date): Promise<number>;

  // Devuelve cuántas sesiones cerró. Si trae `resetTokenId` y el enlace ya no sirve (se gastó entre una petición y otra), lanza `PASSWORD_RESET_INVALID` y no cambia nada.
  abstract change(scope: TenantScope, data: PasswordChange, audit: AuditIntent<{ userId: string; sessionsClosed: number }>): Promise<number>;

  // Crea un enlace nuevo y deja sin efecto los anteriores de esa persona.
  abstract issueResetToken(scope: TenantScope, data: { userId: string; tokenHash: string; expiresAt: Date; at: Date }): Promise<void>;

  abstract countResetRequestsSince(scope: TenantScope, userId: string, since: Date): Promise<number>;

  // Búsqueda previa al tenant: el enlace llega solo con su token (SECURITY DEFINER, como la del desafío del segundo factor).
  abstract findResetTokenByHash(hash: string): Promise<{ scope: TenantScope; token: PasswordResetToken } | null>;
}
