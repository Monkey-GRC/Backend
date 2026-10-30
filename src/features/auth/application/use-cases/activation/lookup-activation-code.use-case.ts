import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../../common/audit/audit-log.writer';
import { DomainError } from '../../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../../common/http/request-meta';
import { normalizeAccessKeyCode } from '../../../../../common/security/access-key-code';
import { TokenHasher } from '../../../../../common/security/token-hasher';
import { TenantScope } from '../../../../../common/tenancy/tenant-scope';
import { ActivationRepository } from '../../../domain/repositories/activation.repository';
import { AccessKeyAttemptLimiter } from '../../services/access-key-attempt-limiter.service';
import { assertActivationAllowed } from '../../services/activation-attempts';

export type ActivationLookup = { email: string; expiresAt: Date };

// Primer paso de la activación (D95): con solo el código, la persona ve con qué correo se activa, ya fijado por Monkey. No crea nada ni gasta el código. Los errores son los
// mismos de la activación, y un código usado, vencido o de una cuenta que ya no está pendiente no revela datos.
@Injectable()
export class LookupActivationCodeUseCase {
  constructor(
    private readonly activations: ActivationRepository,
    private readonly tokens: TokenHasher,
    private readonly limiter: AccessKeyAttemptLimiter,
    private readonly audit: AuditLogWriter,
  ) {}

  async execute(rawCode: string, meta: RequestMeta): Promise<ActivationLookup> {
    assertActivationAllowed(this.limiter, meta.ipAddress);

    const code = normalizeAccessKeyCode(rawCode);
    const found = code ? await this.activations.findByCodeHash(this.tokens.hash(code)) : null;
    if (!found) return this.fail(meta, null, 'unknown_code', new DomainError('ACTIVATION_CODE_INVALID'));

    // Primero el estado del código (usado y vencido tienen su propio mensaje, como la clave de acceso); después, que la cuenta siga esperando su activación.
    const state = found.stateAt(new Date());
    if (state === 'used') return this.fail(meta, found.companyId, 'code_used', new DomainError('ACTIVATION_CODE_ALREADY_USED'));
    if (state === 'expired') return this.fail(meta, found.companyId, 'code_expired', new DomainError('ACTIVATION_CODE_EXPIRED'));
    if (state !== 'redeemable') return this.fail(meta, found.companyId, `code_${state}`, new DomainError('ACTIVATION_CODE_INVALID'));

    const scope: TenantScope = { companyId: found.companyId };
    const account = await this.activations.findAccount(scope, found.userId);
    if (!account || account.status !== 'pending') {
      return this.fail(meta, found.companyId, 'account_not_pending', new DomainError('ACTIVATION_CODE_INVALID'));
    }

    return { email: account.email, expiresAt: found.expiresAt };
  }

  private async fail(meta: RequestMeta, tenantId: string | null, reason: string, error: DomainError): Promise<never> {
    this.limiter.recordFailure(meta.ipAddress);
    await this.audit.write({
      tenantId,
      userId: null,
      action: 'user.activate_lookup',
      resource: 'user_activation_code',
      result: 'error',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState: { reason },
    });
    throw error;
  }
}