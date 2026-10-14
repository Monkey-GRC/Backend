import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';

// Los cargos de la organización que responden ante el auditor y la persona que hoy los ocupa (A1, D30, modelo-datos.md §5.4). Toda escritura recibe su
// `audit`, que se escribe en la MISMA transacción (SEG-36).
export const RESPONSIBLE_TYPES = ['coo', 'it', 'compliance', 'process', 'ciso', 'asset_owner'] as const;
export type ResponsibleType = (typeof RESPONSIBLE_TYPES)[number];

export type Responsible = { id: string; type: ResponsibleType; personName: string; isInUse: boolean };
export type ResponsibleChange = { before: Responsible; after: Responsible };

export abstract class ResponsibleRepository {
  abstract list(scope: TenantScope, filters: { type?: ResponsibleType; page: number; pageSize: number }): Promise<Page<Responsible>>;

  // Lanza ORGANIZATION_NOT_DECLARED y RESPONSIBLE_ALREADY_EXISTS.
  abstract create(scope: TenantScope, input: { type: ResponsibleType; personName: string }, audit: AuditIntent<Responsible>): Promise<Responsible>;

  // null si el cargo no existe (o es de otra empresa). Lanza RESPONSIBLE_ALREADY_EXISTS.
  abstract rename(scope: TenantScope, id: string, personName: string, audit: AuditIntent<ResponsibleChange>): Promise<ResponsibleChange | null>;

  // null si no existe. Lanza RESPONSIBLE_IN_USE si algo apunta al cargo.
  abstract remove(scope: TenantScope, id: string, audit: AuditIntent<Responsible>): Promise<Responsible | null>;
}
