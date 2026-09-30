import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import {
  OrganizationalContext,
  OrganizationalContextInput,
} from '../entities/organizational-context.entity';

export abstract class OrganizationalContextRepository {
  // Lo guardado, o el contexto vacío con la razón social si todavía no se declaró.
  abstract find(scope: TenantScope): Promise<OrganizationalContext>;

  // Cuáles de estos códigos existen en el catálogo de regulaciones.
  abstract existingRegulationCodes(codes: string[]): Promise<string[]>;

  // Crea o actualiza la organización de la empresa y su lista de regulaciones, en una transacción.
  // Devuelve el estado anterior y el nuevo, para el audit trail.
  abstract save(
    scope: TenantScope,
    input: OrganizationalContextInput,
  ): Promise<{ before: OrganizationalContext; after: OrganizationalContext }>;
}
