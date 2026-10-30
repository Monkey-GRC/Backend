import { Inject, Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { RequestMeta } from '../../../../common/http/request-meta';
import { generateAccessKeyCode, normalizeAccessKeyCode } from '../../../../common/security/access-key-code';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { AccessKey } from '../../domain/entities/access-key.entity';
import { CompanyRepository } from '../../domain/repositories/company.repository';
import { AccessKeyDelivery, DeliveryStatus } from '../access-key-delivery.service';
import { ACCESS_KEY_TTL_HOURS } from '../access-key-policy.token';

export type RegenerateAccessKeyResult = { accessKey: AccessKey; deliveryStatus: DeliveryStatus };

// D99 (cierra P2b) · Reenviar la clave de acceso: anula la pendiente, emite otra con vigencia completa y la manda al
// `admin_email`. Como en la base solo vive el hash, no existe «volver a enviar la misma»: reenviar es emitir una nueva.
@Injectable()
export class RegenerateAccessKeyUseCase {
  constructor(
    private readonly companies: CompanyRepository,
    private readonly tokens: TokenHasher,
    private readonly delivery: AccessKeyDelivery,
    @Inject(ACCESS_KEY_TTL_HOURS) private readonly accessKeyTtlHours: number,
  ) {}

  async execute(principal: Principal, companyId: string, meta: RequestMeta): Promise<RegenerateAccessKeyResult> {
    const scope: TenantScope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    const code = generateAccessKeyCode();

    // La clave nunca entra al audit trail, ni en claro ni en hash. El rastro va en la misma transacción que el cambio (SEG-36).
    const { company, accessKey } = await this.companies.rotateAccessKey(
      scope,
      companyId,
      principal.companyId,
      {
        codeHash: this.tokens.hash(normalizeAccessKeyCode(code)),
        expiresAt: new Date(Date.now() + this.accessKeyTtlHours * 3_600_000),
        createdBy: principal.userId,
      },
      (rotated) => ({
        // Acción de plataforma (la hace admin_monkey): tenant_id nulo, como `company.register`.
        tenantId: null,
        userId: principal.userId,
        action: 'access_key.regenerate',
        resource: 'access_key',
        result: 'success',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        afterState: {
          company_id: rotated.company.id,
          access_key_id: rotated.accessKey.id,
          access_key_expires_at: rotated.accessKey.expiresAt.toISOString(),
          revoked_keys: rotated.revokedKeys,
        },
      }),
    );

    const deliveryStatus = await this.delivery.deliver(
      {
        actorId: principal.userId,
        companyId: company.id,
        companyName: company.name,
        adminEmail: company.adminEmail,
        accessKeyId: accessKey.id,
        code,
        expiresAt: accessKey.expiresAt,
      },
      meta,
    );
    return { accessKey, deliveryStatus };
  }
}
