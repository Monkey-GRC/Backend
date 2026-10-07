import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import {
  OrganizationalContext,
  OrganizationalContextInput,
} from '../entities/organizational-context.entity';

export type SavedContext = { before: OrganizationalContext; after: OrganizationalContext };

export abstract class OrganizationalContextRepository {
  // Lo guardado, o el contexto vacío con la razón social si todavía no se declaró.
  abstract find(scope: TenantScope): Promise<OrganizationalContext>;

  // Cuáles de estos códigos existen en el catálogo de regulaciones.
  abstract existingRegulationCodes(codes: string[]): Promise<string[]>;

  // Crea o actualiza la organización de la empresa y su lista de regulaciones, en una transacción.
  // Devuelve el estado anterior y el nuevo, y escribe `audit` en esa misma transacción (SEG-36).
  abstract save(
    scope: TenantScope,
    input: OrganizationalContextInput,
    audit: AuditIntent<SavedContext>,
  ): Promise<SavedContext>;
}
