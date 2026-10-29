import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { ExclusionFilters, ExclusionRecord, ExclusionRepository } from '../../domain/repositories/exclusion.repository';
import { RequestExclusionDto } from '../dtos/exclusion.dto';

// MD-144, D96 · Excluir un activo de un test. La crea y la decide `admin_empresa` en un solo acto (lo impone @Roles en la ruta): nace aprobada y el activo deja de medirse
// desde ya. El auditor la lee.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const day = (d: Date) => d.toISOString().slice(0, 10);
const snapshot = (e: ExclusionRecord) => ({
  id: e.id, service_id: e.serviceId, test_id: e.test.id, asset_id: e.asset.id, status: e.status, valid_from: day(e.validFrom), valid_until: day(e.validUntil),
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

  async execute(p: Principal, serviceId: string, dto: RequestExclusionDto, meta: RequestMeta): Promise<ExclusionRecord> {
    const justification = dto.justification.trim();
    if (!justification) throw new ValidationException([{ field: 'justification', code: 'required' }]);
    const created = await this.repo.create(
      scopeOf(p), serviceId,
      { testId: dto.test_id, assetId: dto.asset_id, justification, technicalJustification: dto.technical_justification?.trim() || null, decidedBy: p.userId, meta },
      (done) => entry(p, meta, 'exclusion.create', null, snapshot(done)),
    );
    if (!created) throw new DomainError('NOT_FOUND');
    return created;
  }
}