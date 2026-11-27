import type { TenantScope } from '../../../../common/tenancy/tenant-scope';
import type { OccurrenceRecord } from '../controls/management-extras';
import type { PersonRef } from '../controls/management-state';

// MD-529 · Lecturas paginadas del historial de gestión de un control y de las ocurrencias de un requisito (contracts/cumplimiento/aprobacion.md).

export const HISTORY_TYPES = [
  'approval', 'return', 'approval_invalidated', 'manual_result', 'level_proposed', 'level_decided', 'plan_registered', 'plan_decided', 'not_applicable_requested', 'not_applicable_decided',
  'not_applicable_reverted', 'occurrence_registered', 'no_occurrences_declared',
] as const;
export type HistoryType = (typeof HISTORY_TYPES)[number];

export type HistoryQuery = { types: readonly HistoryType[]; from?: Date; to?: Date; sort: 'at' | '-at'; page: number; pageSize: number; includeLevels: boolean };
export type HistoryRow = {
  id: string;
  type: HistoryType;
  at: Date;
  actor: PersonRef | null;
  test: { id: string; code: string; testName: string | null; testNameEn: string | null; dimension: string } | null;
  requirement: { id: string; code: string } | null;
  detail: Record<string, unknown>;
};

export abstract class ManagementHistoryRepository {
  /** `null` si el control no existe para esta empresa (dado de baja sí se lee, D119). Devuelve también las partes del control para decidir el acceso. */
  abstract controlAccess(scope: TenantScope, controlId: string): Promise<{ owner: { id: string } | null; executor: { id: string } | null } | null>;
  abstract history(scope: TenantScope, controlId: string, query: HistoryQuery): Promise<{ items: HistoryRow[]; total: number }>;
  abstract occurrences(scope: TenantScope, controlId: string, requirementId: string, query: { quarterStart?: Date; page: number; pageSize: number }): Promise<{ items: OccurrenceRecord[]; total: number; requirement: { id: string; code: string } } | null>;
}
