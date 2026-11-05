import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { GroupKind, TeamGroup } from '../team.types';

// Los grupos de la empresa (platform.user_groups). Toda escritura recibe su `audit`, que se escribe en la MISMA transacción (SEG-36).

export type NewGroup = { name: string; kind: GroupKind; leaderId: string };

export type GroupRenamed = { before: TeamGroup; after: TeamGroup };

export type GroupFilters = {
  /** Si viene, solo los grupos que lidera esa persona (lo impone el servidor al responsable). */
  leaderId?: string;
  sort: 'name' | '-name';
  page: number;
  pageSize: number;
};

export abstract class TeamGroupRepository {
  // Orden estable: el pedido y luego el id.
  abstract list(scope: TenantScope, filters: GroupFilters): Promise<Page<TeamGroup>>;

  // `kind = team`: NOT_FOUND si el líder no es un responsable activo o pendiente de la empresa; TEAM_ALREADY_EXISTS si ya lidera un equipo. GROUP_NAME_TAKEN si el nombre ya existe.
  abstract create(scope: TenantScope, input: NewGroup, audit: AuditIntent<TeamGroup>): Promise<TeamGroup>;

  // Una sola transacción: lee el grupo, pasa el actual a `check` (que lanza el error de negocio si no se puede renombrar), escribe y audita.
  // null si no existe o es de otra empresa (404). GROUP_NAME_TAKEN si el nombre ya existe.
  abstract rename(scope: TenantScope, id: string, name: string, check: (current: TeamGroup) => void, audit: AuditIntent<GroupRenamed>): Promise<TeamGroup | null>;
}
