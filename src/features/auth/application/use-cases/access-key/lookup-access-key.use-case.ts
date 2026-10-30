import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../../common/audit/audit-log.writer';
import { DomainError } from '../../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../../common/http/request-meta';
import { normalizeAccessKeyCode } from '../../../../../common/security/access-key-code';
import { TokenHasher } from '../../../../../common/security/token-hasher';
import { TenantScope } from '../../../../../common/tenancy/tenant-scope';
import { AccessKeyRedemptionRepository } from '../../../domain/repositories/access-key-redemption.repository';
import { AccessKeyAttemptLimiter } from '../../services/access-key-attempt-limiter.service';

export type AccessKeyLookup = {
  companyName: string;
  adminEmail: string;
  expiresAt: Date;
};

// Primer paso de la activación (D51): con solo el código, el cliente ve de qué empresa es y con qué
// correo se activa, ya fijados por Monkey Admin. No crea nada ni gasta la clave. Los errores son los
// mismos del canje, y una clave usada, vencida o de una empresa suspendida no revela datos.
@Injectable()
export class LookupAccessKeyUseCase {
  constructor(
    private readonly redemptions: AccessKeyRedemptionRepository,
    private readonly tokens: TokenHasher,
    private readonly limiter: AccessKeyAttemptLimiter,
    private readonly audit: AuditLogWriter,
  ) {}

  async execute(rawCode: string, meta: RequestMeta): Promise<AccessKeyLookup> {
    this.limiter.assertAllowed(meta.ipAddress);

    const code = normalizeAccessKeyCode(rawCode);
    const key = code ? await this.redemptions.findByCodeHash(this.tokens.hash(code)) : null;
    if (!key) return this.fail(meta, null, 'unknown_key', new DomainError('ACCESS_KEY_INVALID'));

    const scope: TenantScope = { companyId: key.companyId, role: 'admin_empresa' };
    const company = await this.redemptions.findCompany(scope);
    if (!company || company.status !== 'active') {
      return this.fail(meta, key.companyId, 'company_not_active', new DomainError('ACCESS_KEY_INVALID'));
    }

    const state = key.stateAt(new Date());
    if (state === 'used') return this.fail(meta, key.companyId, 'key_used', new DomainError('ACCESS_KEY_ALREADY_USED'));
    if (state === 'expired') return this.fail(meta, key.companyId, 'key_expired', new DomainError('ACCESS_KEY_EXPIRED'));
    if (state !== 'redeemable') return this.fail(meta, key.companyId, `key_${state}`, new DomainError('ACCESS_KEY_INVALID'));

    return { companyName: company.name, adminEmail: company.adminEmail, expiresAt: key.expiresAt };
  }

  private async fail(meta: RequestMeta, tenantId: string | null, reason: string, error: DomainError): Promise<never> {
    this.limiter.recordFailure(meta.ipAddress);
    await this.audit.write({
      tenantId,
      userId: null,
      action: 'access_key.lookup',
      resource: 'access_key',
      result: 'error',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState: { reason },
    });
    throw error;
  }
}
