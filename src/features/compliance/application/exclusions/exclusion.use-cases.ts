import { Injectable, Logger } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { ExclusionExpiry, ExclusionFilters, ExclusionRecord, ExclusionRepository } from '../../domain/exclusions/exclusion.repository';
import { utcDay } from '../../domain/periods/evaluation-period';
import { parseDay } from '../risks/risk-assessment.validation';
import { RequestExclusionDto } from './exclusion.dto';

// MD-144, MD-501, D96, D135 · Excepción del FAIL de una prueba en un activo. La propone y la decide `admin_empresa` en un solo acto (lo impone @Can en la ruta): nace aprobada, con su fecha de fin. El auditor la lee.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const day = (d: Date) => d.toISOString().slice(0, 10);
const snapshot = (e: ExclusionRecord) => ({
  id: e.id, service_id: e.serviceId, test_id: e.test.id, asset_id: e.asset.id, status: e.status, valid_from: day(e.validFrom), valid_until: day(e.validUntil), effective_until: day(e.effectiveUntil),
});
const entry = (p: Principal, meta: RequestMeta, action: string, before: unknown, after: unknown): AuditEntry => ({
  tenantId: p.companyId, userId: p.userId, action, resource: 'exclusion', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
  beforeState: (before as Record<string, unknown>) ?? null, afterState: (after as Record<string, unknown>) ?? null,
});

@Injectable()
export class ListExclusionsUseCase {
  constructor(private readonly repo: ExclusionRepository) {}

  async execute(p: Principal, serviceId: string, filters: ExclusionFilters): Promise<Page<ExclusionRecord>> {
    const page = await this.repo.list(scopeOf(p), serviceId, filters);
    if (!page) throw new DomainError('NOT_FOUND');
    return page;
  }
}

@Injectable()
export class RequestExclusionUseCase {
  constructor(private readonly repo: ExclusionRepository) {}

  async execute(p: Principal, serviceId: string, dto: RequestExclusionDto, meta: RequestMeta, now: Date = new Date()): Promise<ExclusionRecord> {
    const justification = dto.justification.trim();
    if (!justification) throw new ValidationException([{ field: 'justification', code: 'required' }]);
    const technicalJustification = dto.technical_justification.trim();
    if (!technicalJustification) throw new ValidationException([{ field: 'technical_justification', code: 'required' }]);
    // D135 · La fecha de fin es posterior a hoy; el tope de PR-04 lo valida el repositorio, que carga los parámetros del tenant.
    const validUntil = parseDay(dto.valid_until, 'valid_until');
    if (validUntil.getTime() <= utcDay(now).getTime()) throw new ValidationException([{ field: 'valid_until', code: 'date.min' }]);
    const created = await this.repo.create(
      scopeOf(p), serviceId,
      { testId: dto.test_id, assetId: dto.asset_id, justification, technicalJustification, validUntil, decidedBy: p.userId, meta },
      (done) => entry(p, meta, 'exclusion.create', null, snapshot(done)),
    );
    if (!created) throw new DomainError('NOT_FOUND');
    return created;
  }
}
// D135 · La tarea diaria del vencimiento. Cada empresa en su transacción: si una falla, se registra y sigue con la siguiente; la siguiente pasada la reintenta (todo es idempotente).
export type ExpireExclusionsResult = { tenants: number; failed: number; expired: number };

@Injectable()
export class ExpireExclusionsUseCase {
  private readonly logger = new Logger(ExpireExclusionsUseCase.name);

  constructor(private readonly expiry: ExclusionExpiry) {}

  // `tenantIds` acota la pasada a esas empresas (las pruebas); sin él, todas las no archivadas.
  async execute(now: Date = new Date(), tenantIds?: readonly string[]): Promise<ExpireExclusionsResult> {
    const result: ExpireExclusionsResult = { tenants: 0, failed: 0, expired: 0 };
    for (const tenantId of (await this.expiry.listTenantIds()).filter((id) => !tenantIds || tenantIds.includes(id))) {
      try {
        result.expired += await this.expiry.expireTenant(tenantId, now);
        result.tenants++;
      } catch (error) {
        result.failed++;
        this.logger.error(`Falló el vencimiento de excepciones de la empresa ${tenantId}: ${(error as Error).message}`);
      }
    }
    return result;
  }
}
