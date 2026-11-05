import { AccessKey } from '../domain/entities/access-key.entity';
import {
  CompanyDetail,
  CompanyOverview,
  ContractedFramework,
} from '../domain/entities/company-overview';
import { Company } from '../domain/entities/company.entity';
import type { DeliveryStatus } from '../application/access-key-delivery.service';
import { RegisterCompanyResult } from '../application/use-cases/register-company.use-case';

// Formas de contracts/modules/monkey-admin.md, en snake_case. Ni `code` ni `code_hash` salen nunca en una respuesta (D99).

const iso = (date: Date | null) => date?.toISOString() ?? null;

const companyFields = (c: Company) => ({
  id: c.id,
  name: c.name,
  admin_email: c.adminEmail,
  isolation_strategy: c.isolationStrategy,
  status: c.status,
  max_users: c.maxUsers,
  created_at: c.createdAt.toISOString(),
  // D97: solo una empresa archivada trae estos campos.
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
    // Recién registrada: aún no tiene cuentas.
    users_count: 0,
    frameworks: frameworksField(result.frameworks),
    updated_at: result.company.updatedAt.toISOString(),
    access_key: toIssuedAccessKey(result.accessKey, result.deliveryStatus, now),
  };
}

// D99 · La clave nunca sale en una respuesta: viaja por correo. Aquí solo si el correo salió.
export const toIssuedAccessKey = (key: AccessKey, deliveryStatus: DeliveryStatus, now = new Date()) => ({
  id: key.id,
  status: key.statusAt(now),
  expires_at: key.expiresAt.toISOString(),
  delivery_status: deliveryStatus,
});

export function toCompanyListItem(overview: CompanyOverview, now = new Date()) {
  const key = overview.currentAccessKey;
  return {
    ...companyFields(overview.company),
    users_count: overview.usersCount,
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
