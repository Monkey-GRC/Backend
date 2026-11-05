import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { TeamMember, TeamRole } from '../team.types';

// Las cuentas del equipo (platform.users + user_activation_codes). Toda escritura recibe su `audit`, que se escribe en la MISMA transacción (SEG-36).

/**
 * Dónde queda la cuenta nueva. El caso de uso decide la forma según quién crea y el rol; el repositorio resuelve los grupos dentro de la transacción del alta
 * (NOT_FOUND si el grupo no existe en la empresa o no sirve de destino; RESPONSIBLE_HAS_NO_TEAM si el responsable que crea aún no tiene equipo; FORBIDDEN si un responsable pide un equipo que no es el suyo).
 */
export type Placement =
  | { kind: 'none' }
  // Un responsable nuevo: un grupo de responsables del administrador, o el grupo «Responsables» (se crea si falta, con el administrador que crea como líder).
  | { kind: 'responsibles-group'; groupId: string | null }
  // Un delegado que ubica el administrador: el equipo de un responsable activo o pendiente.
  | { kind: 'team-of'; groupId: string }
  // Un responsable que crea un delegado: su propio equipo, que ya debe existir (RESPONSIBLE_HAS_NO_TEAM). Si manda `groupId`, tiene que ser ese.
  | { kind: 'own-team'; leaderId: string; groupId: string | null };

export type NewMember = {
  email: string;
  name: string;
  lastName: string;
  role: TeamRole;
  isInternal: boolean | null;
  placement: Placement;
  /** Contraseña imposible de adivinar: la cuenta nace `pending` y no puede iniciar sesión hasta activarla. */
  passwordHash: string;
  codeHash: string;
  codeExpiresAt: Date;
  createdBy: string;
};

export type MemberFilters = {
  role?: string;
  status?: string;
  groupId?: string;
  isInternal?: boolean;
  /** Si viene, solo las cuentas del equipo que lidera esa persona (lo impone el servidor al responsable). */
  teamLeaderId?: string;
  sort: 'created_at' | '-created_at' | 'email' | '-email';
  page: number;
  pageSize: number;
};

export type MemberChange = { status?: 'active' | 'inactive'; name?: string; lastName?: string };

export type MemberUpdated = { before: TeamMember; after: TeamMember; sessionsClosed: number };

export abstract class TeamUserRepository {
  // EMAIL_TAKEN si ya hay una cuenta con ese correo (el correo es único global). Un responsable nuevo queda solo en «Responsables»: su equipo de delegados no nace con él (D104).
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
