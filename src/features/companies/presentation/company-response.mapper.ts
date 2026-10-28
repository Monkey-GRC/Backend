import { AccessKey } from '../domain/entities/access-key.entity';
import {
  CompanyDetail,
  CompanyOverview,
  ContractedFramework,
} from '../domain/entities/company-overview';
import { Company } from '../domain/entities/company.entity';
import { RegisterCompanyResult } from '../application/use-cases/register-company.use-case';

// Formas de contracts/modules/monkey-admin.md, en snake_case. Ni `code` ni `code_hash` salen
// nunca en un listado o detalle: el código en claro solo viaja en la respuesta del registro.

const iso = (date: Date | null) => date?.toISOString() ?? null;

const companyFields = (c: Company) => ({
  id: c.id,
  name: c.name,
  admin_email: c.adminEmail,
  isolation_strategy: c.isolationStrategy,
  status: c.status,
  created_at: c.createdAt.toISOString(),
  // D95: solo una empresa archivada trae estos campos.
  deactivated_at: iso(c.archive?.deactivatedAt ?? null),
  archive_until: iso(c.archive?.archiveUntil ?? null),
  deactivation_reason_code: c.archive?.reasonCode ?? null,
  deactivation_reason: c.archive?.reason ?? null,
});

const frameworksField = (frameworks: ContractedFramework[]) =>
  frameworks.map((f) => ({ code: f.code, name: f.name, contracted_at: f.contractedAt }));

export function toRegisteredCompanyResponse(result: RegisterCompanyResult) {
  const now = new Date();
  return {
    ...companyFields(result.company),
    frameworks: frameworksField(result.frameworks),
    updated_at: result.company.updatedAt.toISOString(),
    access_key: {
      id: result.accessKey.id,
      code: result.accessKeyCode,
      status: result.accessKey.statusAt(now),
      expires_at: result.accessKey.expiresAt.toISOString(),
    },
  };
}

export function toCompanyListItem(overview: CompanyOverview, now = new Date()) {
  const key = overview.currentAccessKey;
  return {
    ...companyFields(overview.company),
    frameworks: frameworksField(overview.frameworks),
    access_key_status: key?.statusAt(now) ?? null,
    access_key_expires_at: iso(key?.expiresAt ?? null),
    onboarding_completed: overview.onboardingCompleted,
  };
}

const toAccessKeyHistoryItem = (key: AccessKey, now: Date) => ({
  id: key.id,
  status: key.statusAt(now),
  expires_at: key.expiresAt.toISOString(),
  used_at: iso(key.usedAt),
});

export function toCompanyDetail(detail: CompanyDetail) {
  const now = new Date();
  return {
    ...toCompanyListItem(detail, now),
    updated_at: detail.company.updatedAt.toISOString(),
    access_keys: detail.accessKeys.map((key) => toAccessKeyHistoryItem(key, now)),
  };
}
