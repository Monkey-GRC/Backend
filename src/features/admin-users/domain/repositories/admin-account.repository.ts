import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { AdminAccount, AdminFilters, DeactivationOutcome, PurgedAdmin, ReactivationOutcome } from '../admin-account';

export type NewAdmin = {
  email: string;
  name: string;
  lastName: string;
  /** Contraseña imposible de adivinar: la cuenta nace `pending` y no entra hasta activarla. */
  passwordHash: string;
  codeHash: string;
  codeExpiresAt: Date;
  createdBy: string;
  language: 'es' | 'en';
};

// Las cuentas `admin_monkey` (platform.users de la empresa interna). Toda escritura recibe su `audit`, que va en la MISMA transacción (SEG-36).
// Orden de bloqueos: las filas de los admin_monkey en orden ascendente por id (como row-locks.ts, paso 1); después sesiones y desafíos; la auditoría al final.
export abstract class AdminAccountRepository {
  // ACCOUNT_INACTIVE si quien invita ya no está activo; EMAIL_TAKEN si el correo ya tiene cuenta. La empresa interna no tiene cupo de usuarios (D117).
  abstract invite(scope: TenantScope, input: NewAdmin, audit: AuditIntent<AdminAccount>): Promise<AdminAccount>;

  abstract list(scope: TenantScope, filters: AdminFilters): Promise<Page<AdminAccount>>;

  // Nombre de quien invita, para el correo. Solo lectura.
  abstract inviterName(scope: TenantScope, inviterId: string): Promise<string | null>;

  // Revoca el código vigente y emite uno nuevo. null si no existe o no es admin_monkey (404); USER_ALREADY_ACTIVE si no está `pending`.
  abstract reissueCode(scope: TenantScope, id: string, input: { codeHash: string; codeExpiresAt: Date; createdBy: string }, audit: AuditIntent<AdminAccount>): Promise<AdminAccount | null>;

  // Una transacción con TODAS las filas de admin_monkey bloqueadas por id. null si no existe (404). Orden: ACCOUNT_INACTIVE (quien actúa) · 404 · CANNOT_DEACTIVATE_SELF ·
  // USER_NOT_ACTIVATED · ADMIN_ALREADY_INACTIVE · LAST_ADMIN (cuentan solo los `active`). Los dos rechazos de seguridad (uno mismo, último) no lanzan: se confirman con su
  // auditoría `error` y vuelven como `refused`. Desactivar cierra sesiones y desafíos de segundo factor abiertos.
  abstract deactivate(scope: TenantScope, id: string, at: Date, purgeAt: Date, audit: AuditIntent<DeactivationOutcome>): Promise<DeactivationOutcome | null>;

  // null si no existe, ya se purgó o venció su plazo (404); ADMIN_NOT_INACTIVE si no está en gracia.
  abstract reactivate(scope: TenantScope, id: string, at: Date, audit: AuditIntent<ReactivationOutcome>): Promise<ReactivationOutcome | null>;

  // La purga programada: las cuentas en gracia con el plazo vencido, de cualquier empresa.
  abstract listDueForPurge(now: Date): Promise<Array<{ id: string; companyId: string }>>;

  // Sello + borrado de las filas propias + borrado de la cuenta + auditoría `admin.purge`, en UNA transacción, con la fila bloqueada y el estado vuelto a comprobar.
  // false si ya no corresponde (otra réplica la purgó, se reactivó): idempotente.
  abstract purge(companyId: string, id: string, now: Date, audit: AuditIntent<PurgedAdmin>): Promise<boolean>;
}
