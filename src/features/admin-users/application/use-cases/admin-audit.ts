import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { RequestMeta } from '../../../../common/http/request-meta';
import { AdminAccount } from '../../domain/admin-account';

// Nunca va el código de activación ni el `totp_code`, ni el correo de nadie más que el de la cuenta afectada (SEG-36, conventions.md).
export const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });

export const snapshot = (a: AdminAccount) => ({ id: a.id, email: a.email, name: a.name, last_name: a.lastName, role: a.role, status: a.status, purge_at: a.purgeAt ? a.purgeAt.toISOString() : null });

export const adminEntry = (
  p: Principal,
  meta: RequestMeta,
  action: string,
  result: 'success' | 'error',
  before: unknown,
  after: unknown,
): AuditEntry => ({
  tenantId: p.companyId,
  userId: p.userId,
  action,
  resource: 'user',
  result,
  ipAddress: meta.ipAddress,
  userAgent: meta.userAgent,
  beforeState: (before as Record<string, unknown>) ?? null,
  afterState: (after as Record<string, unknown>) ?? null,
});
