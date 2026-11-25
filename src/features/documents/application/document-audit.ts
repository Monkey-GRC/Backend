import { HttpStatus } from '@nestjs/common';
import type { AuditEntry, AuditLogWriter } from '../../../common/audit/audit-log.writer';
import type { Principal } from '../../../common/auth/principal';
import { DomainError } from '../../../common/errors/domain-error';
import { DOMAIN_ERROR_CATALOG } from '../../../common/errors/domain-error.catalog';
import type { RequestMeta } from '../../../common/http/request-meta';
import type { TenantScope } from '../../../common/tenancy/tenant-scope';

export const scopeOf = (p: Principal): TenantScope => ({ companyId: p.companyId, userId: p.userId, role: p.role });

export const documentEntry = (p: Principal, meta: RequestMeta, action: string, resource: string, before: Record<string, unknown> | null, after: Record<string, unknown> | null): AuditEntry => ({
  tenantId: p.companyId, userId: p.userId, action, resource, result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent, beforeState: before, afterState: after,
});

/**
 * contracts/documentos.md · «Auditoría»: los `403` y `409` se registran con `result = error`, de mejor esfuerzo (no hay efecto con el que ser atómico). Un `404` no: que no exista no es un intento.
 * El error original siempre se relanza.
 */
export async function withFailureAudit<T>(writer: AuditLogWriter, p: Principal, meta: RequestMeta, action: string, resource: string, subject: Record<string, unknown>, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof DomainError && (error.code === 'FORBIDDEN' || DOMAIN_ERROR_CATALOG[error.code].status === HttpStatus.CONFLICT)) {
      await writer.write({ ...documentEntry(p, meta, action, resource, null, { ...subject, error_code: error.code }), result: 'error' });
    }
    throw error;
  }
}
