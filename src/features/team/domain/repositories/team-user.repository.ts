import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { TeamMember, TeamRole } from '../team.types';

// Las cuentas del equipo (platform.users + user_activation_codes). Toda escritura recibe su `audit`, que se escribe en la MISMA transacción (SEG-36).

export type NewMember = {
  email: string;
  name: string;
  lastName: string;
  role: TeamRole;
  /** Contraseña imposible de adivinar: la cuenta nace `pending` y no puede iniciar sesión hasta activarla. */
  passwordHash: string;
  codeHash: string;
  codeExpiresAt: Date;
  createdBy: string;
};

export type MemberFilters = { role?: string; status?: string; sort: 'created_at' | '-created_at' | 'email' | '-email'; page: number; pageSize: number };

export type MemberChange = { status?: 'active' | 'inactive'; name?: string; lastName?: string };

export type MemberUpdated = { before: TeamMember; after: TeamMember; sessionsClosed: number };

export abstract class TeamUserRepository {
  // EMAIL_TAKEN si ya hay una cuenta con ese correo (el correo es único global).
  abstract create(scope: TenantScope, input: NewMember, audit: AuditIntent<TeamMember>): Promise<TeamMember>;

  abstract list(scope: TenantScope, filters: MemberFilters): Promise<Page<TeamMember>>;

  // null si no existe, es de otra empresa o es `admin_monkey` (404).
  // LAST_ADMIN si uno mismo se desactiva (el nombre sí se puede corregir); USER_NOT_ACTIVATED si cambia el estado de una cuenta `pending`. Desactivar cierra todas sus sesiones en la misma transacción.
  abstract update(scope: TenantScope, id: string, change: MemberChange, at: Date, audit: AuditIntent<MemberUpdated>): Promise<TeamMember | null>;

  // Revoca el código vigente y emite uno nuevo. null si no existe o no es del equipo (404); USER_ALREADY_ACTIVE si la cuenta ya no está `pending`.
  abstract reissueCode(
    scope: TenantScope,
    id: string,
    input: { codeHash: string; codeExpiresAt: Date; createdBy: string },
    audit: AuditIntent<TeamMember>,
  ): Promise<TeamMember | null>;
}
