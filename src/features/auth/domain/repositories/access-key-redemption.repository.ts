import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { RedeemableAccessKey, RedeemingCompany } from '../entities/redeemable-access-key.entity';

export type NewCompanyAdmin = {
  email: string;
  passwordHash: string;
};

export type RedeemOutcome =
  | { kind: 'created'; userId: string }
  | { kind: 'already_used' }
  | { kind: 'email_taken' };

export abstract class AccessKeyRedemptionRepository {
  // Búsqueda previa al tenant: el canje llega solo con la clave (find_access_key, D29).
  abstract findByCodeHash(codeHash: string): Promise<RedeemableAccessKey | null>;

  abstract findCompany(scope: TenantScope): Promise<RedeemingCompany | null>;

  // En una sola transacción: marca la clave como usada (solo si seguía pendiente, así dos canjes
  // simultáneos no crean dos cuentas) y crea el admin_empresa. Si algo falla, no queda nada a medias. `audit` se
  // escribe en esa misma transacción, solo si el canje se produjo (SEG-36): sin rastro no hay cuenta.
  abstract redeem(
    scope: TenantScope,
    accessKeyId: string,
    admin: NewCompanyAdmin,
    at: Date,
    audit: AuditIntent<{ userId: string }>,
  ): Promise<RedeemOutcome>;
}
