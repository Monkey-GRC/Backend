import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { ActivatingAccount, RedeemableActivationCode } from '../entities/redeemable-activation-code.entity';

export type ActivateOutcome = { kind: 'activated' } | { kind: 'already_used' };

export abstract class ActivationRepository {
  // Búsqueda previa al tenant: la activación llega solo con el código (platform.find_activation_code, D95).
  abstract findByCodeHash(codeHash: string): Promise<RedeemableActivationCode | null>;

  // La cuenta que el código activa. `scope.companyId` es la empresa de esa cuenta (la del código).
  abstract findAccount(scope: TenantScope, userId: string): Promise<ActivatingAccount | null>;

  // En una sola transacción: marca el código como usado (solo si seguía pendiente y vigente, así dos activaciones simultáneas no la gastan dos veces), pone la contraseña
  // y pasa la cuenta de `pending` a `active`. `audit` se escribe en esa misma transacción (SEG-36): sin rastro no hay activación.
  abstract activate(
    scope: TenantScope,
    codeId: string,
    userId: string,
    passwordHash: string,
    at: Date,
    audit: AuditIntent<{ userId: string }>,
  ): Promise<ActivateOutcome>;
}