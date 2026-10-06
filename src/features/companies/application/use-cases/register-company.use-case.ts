import { Inject, Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import {
  generateAccessKeyCode,
  normalizeAccessKeyCode,
} from '../../../../common/security/access-key-code';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { AccessKey } from '../../domain/entities/access-key.entity';
import { ContractedFramework } from '../../domain/entities/company-overview';
import { Company } from '../../domain/entities/company.entity';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { CompanyRepository } from '../../domain/repositories/company.repository';
import { ACCESS_KEY_TTL_HOURS } from '../access-key-policy.token';

export type RegisterCompanyInput = {
  name: string;
  requiresDedicatedDatabase: boolean;
  adminEmail: string;
  // Marcos que se contratan para la empresa (D47).
  frameworkCodes: string[];
};

export type RegisterCompanyResult = {
  company: Company;
  accessKey: AccessKey;
  frameworks: ContractedFramework[];
  // En claro solo aquí, una vez: no se guarda ni se puede volver a consultar.
  accessKeyCode: string;
};

@Injectable()
export class RegisterCompanyUseCase {
  constructor(
    private readonly companies: CompanyRepository,
    private readonly tokens: TokenHasher,
    private readonly audit: AuditLogWriter,
    @Inject(ACCESS_KEY_TTL_HOURS) private readonly accessKeyTtlHours: number,
  ) {}

  async execute(
    principal: Principal,
    input: RegisterCompanyInput,
    meta: RequestMeta,
  ): Promise<RegisterCompanyResult> {
    // Base dedicada: el aprovisionamiento no está reconstruido y el flujo depende de P2(d), que
    // sigue abierta. No se inventa: se rechaza con un mensaje claro hasta que exista.
    if (input.requiresDedicatedDatabase) {
      throw new DomainError('DEDICATED_DATABASE_NOT_AVAILABLE');
    }

    const scope: TenantScope = {
      companyId: principal.companyId,
      userId: principal.userId,
      role: principal.role,
    };
    const name = Company.normalizeName(input.name);
    const adminEmail = Company.normalizeEmail(input.adminEmail);

    if (await this.companies.existsActiveWithName(scope, name)) {
      throw new DomainError('COMPANY_NAME_TAKEN');
    }
    if (await this.companies.existsWithAdminEmail(scope, adminEmail)) {
      throw new DomainError('ADMIN_EMAIL_TAKEN');
    }

    // Un código que no está en el catálogo no es una opción; uno que está pero aún no se construyó
    // (hoy todos menos SOC 2, D50) se ofrece como gancho comercial, pero no se puede contratar.
    const existing = new Set(await this.companies.existingFrameworkCodes(input.frameworkCodes));
    if (input.frameworkCodes.some((code) => !existing.has(code))) {
      throw new ValidationException([{ field: 'framework_codes', code: 'enum.invalid' }]);
    }
    const available = new Set(await this.companies.availableFrameworkCodes(input.frameworkCodes));
    const unavailable = input.frameworkCodes.filter((code) => !available.has(code));
    if (unavailable.length > 0) {
      throw new DomainError('FRAMEWORK_NOT_AVAILABLE', { framework_codes: unavailable });
    }

    const accessKeyCode = generateAccessKeyCode();
    const { company, accessKey, frameworks } = await this.companies.createWithAccessKey(
      scope,
      {
        name,
        adminEmail,
        isolationStrategy: Company.isolationFor(input.requiresDedicatedDatabase),
        frameworkCodes: input.frameworkCodes,
      },
      {
        codeHash: this.tokens.hash(normalizeAccessKeyCode(accessKeyCode)),
        expiresAt: new Date(Date.now() + this.accessKeyTtlHours * 3_600_000),
        createdBy: principal.userId,
      },
    );

    // Acción de plataforma: tenant_id nulo (la hace admin_monkey, no la empresa). La clave nunca
    // entra al audit trail, ni en claro ni en hash.
    await this.audit.write({
      tenantId: null,
      userId: principal.userId,
      action: 'company.register',
      resource: 'company',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState: {
        company_id: company.id,
        name: company.name,
        admin_email: company.adminEmail,
        isolation_strategy: company.isolationStrategy,
        framework_codes: frameworks.map((f) => f.code),
        access_key_id: accessKey.id,
        access_key_expires_at: accessKey.expiresAt.toISOString(),
      },
    });

    return { company, accessKey, frameworks, accessKeyCode };
  }
}
