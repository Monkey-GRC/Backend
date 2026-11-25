import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { InvitationContext, ReleasedControl, TeamMember, TeamRole } from '../team.types';

// Las cuentas del equipo (platform.users + user_activation_codes). Toda escritura recibe su `audit`, que se escribe en la MISMA transacción (SEG-36).

/**
 * Dónde queda la cuenta nueva. El caso de uso decide la forma según quién crea y el rol; el repositorio resuelve los grupos dentro de la transacción del alta
 * (NOT_FOUND si el grupo no existe en la empresa o no sirve de destino).
 */
export type Placement =
  | { kind: 'none' }
  // Un responsable nuevo: un grupo de responsables del administrador, o el grupo «Responsables» (se crea si falta, con el administrador que crea como líder).
  | { kind: 'responsibles-group'; groupId: string | null }
  // Un delegado: el equipo de un responsable activo o pendiente (lo ubica el administrador, D150).
  | { kind: 'team-of'; groupId: string };

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
  // D111 · La cuenta nace con el idioma de quien la invita.
  language: 'es' | 'en';
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

// `groupId` mueve a un delegado a otro equipo; `confirmUnassign` solo se evalúa al desactivar o mover; `isInternal` solo vale para un delegado.
export type MemberChange = { status?: 'active' | 'inactive'; name?: string; lastName?: string; groupId?: string; isInternal?: boolean; confirmUnassign?: boolean };

export type MemberUpdated = { before: TeamMember; after: TeamMember; sessionsClosed: number; controlsUnassigned: number; released: ReleasedControl[] };

export abstract class TeamUserRepository {
  // EMAIL_TAKEN si ya hay una cuenta con ese correo (el correo es único global). Un responsable nuevo queda solo en «Responsables»: su equipo de delegados no nace con él (D104).
  abstract create(scope: TenantScope, input: NewMember, audit: AuditIntent<TeamMember>): Promise<TeamMember>;

  // Quién invita (su nombre, o su correo si no tiene) y el nombre de la empresa, para el correo. Solo lectura, antes de escribir nada.
  abstract invitationContext(scope: TenantScope, inviterId: string): Promise<InvitationContext>;

  abstract list(scope: TenantScope, filters: MemberFilters): Promise<Page<TeamMember>>;

  // null si no existe, es de otra empresa o es `admin_monkey` (404). Todo en UNA transacción, con la fila de la persona bloqueada (FOR UPDATE) antes de leerla.
  // Orden de bloqueos (sin deadlock): la fila del sujeto, luego la del responsable líder (FOR SHARE), luego la fila de la empresa (cupo). Nunca al revés.
  // Orden de comprobaciones: 404 · LAST_ADMIN (uno mismo) · 422 (group_id / is_internal no admitidos) · USER_NOT_ACTIVATED · RESPONSIBLE_HAS_DELEGATES · USER_HAS_ASSIGNMENTS · aplicar.
  // Desactivar: cierra sus sesiones; un responsable con delegados activos o pendientes no se desactiva (aun con confirmación, `delegates_count`). Con controles: USER_HAS_ASSIGNMENTS
  // (`controls_count`) sin `confirmUnassign`; con él, el delegado deja sin ejecutor sus controles y el dueño (responsable o admin_empresa) deja «Sin asignar» los suyos (se borra la asignación).
  // Mover (`groupId`): 422 `group_id.not_allowed` si no es un delegado; NOT_FOUND si el destino no es el `team` de un responsable activo o pendiente; el mismo equipo no cambia nada; igual que desactivar con los controles que ejecuta.
  // Reactivar: cupo (USER_LIMIT_REACHED) y, para un delegado, TEAM_LEADER_INACTIVE si su responsable no está activo ni pendiente. No devuelve asignaciones.
  // LAST_ADMIN si uno mismo se desactiva (el nombre sí se puede corregir); USER_NOT_ACTIVATED si cambia el estado de una cuenta `pending`.
  abstract update(scope: TenantScope, id: string, change: MemberChange, at: Date, audit: AuditIntent<MemberUpdated>): Promise<TeamMember | null>;

  // Revoca el código vigente y emite uno nuevo. null si no existe o no es del equipo (404); USER_ALREADY_ACTIVE si la cuenta ya no está `pending`.
  abstract reissueCode(
    scope: TenantScope,
    id: string,
    input: { codeHash: string; codeExpiresAt: Date; createdBy: string },
    audit: AuditIntent<TeamMember>,
  ): Promise<TeamMember | null>;
}
