import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { ExclusionFilters, ExclusionRecord, ExclusionRepository } from '../../domain/repositories/exclusion.repository';
import { DecideExclusionDto, RequestExclusionDto } from '../dtos/exclusion.dto';

// MD-144 · Excluir un activo de un test. La propone `admin_empresa` y la decide `consultor` (D78; lo impone @Roles en la ruta); el auditor y la empresa la leen.
// Mientras está pendiente no cambia nada: el activo se sigue midiendo.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const day = (d: Date) => d.toISOString().slice(0, 10);
const snapshot = (e: ExclusionRecord) => ({
  id: e.id, service_id: e.serviceId, test_id: e.test.id, asset_id: e.asset.id, status: e.status, valid_from: day(e.validFrom), valid_until: day(e.validUntil), decision_note: e.decisionNote,
});
const entry = (p: Principal, meta: RequestMeta, action: string, before: unknown, after: unknown): AuditEntry => ({
  tenantId: p.companyId, userId: p.userId, action, resource: 'exclusion', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
  beforeState: (before as Record<string, unknown>) ?? null, afterState: (after as Record<string, unknown>) ?? null,
});

/** Una exclusión con lo que la pantalla necesita para avisar que falta un consultor (P24, D83). */
export type ExclusionView = { exclusion: ExclusionRecord; awaitingConsultant: boolean };

@Injectable()
export class ListExclusionsUseCase {
  constructor(private readonly repo: ExclusionRepository) {}

  async execute(p: Principal, serviceId: string, filters: ExclusionFilters): Promise<Page<ExclusionView>> {
    const page = await this.repo.list(scopeOf(p), serviceId, filters);
    if (!page) throw new DomainError('NOT_FOUND');
    const hasConsultant = await this.repo.hasActiveConsultant(scopeOf(p));
    return { ...page, items: page.items.map((exclusion) => ({ exclusion, awaitingConsultant: exclusion.status === 'pending' && !hasConsultant })) };
  }
}

@Injectable()
export class RequestExclusionUseCase {
  constructor(private readonly repo: ExclusionRepository) {}

  async execute(p: Principal, serviceId: string, dto: RequestExclusionDto, meta: RequestMeta): Promise<ExclusionView> {
    const justification = dto.justification.trim();
    if (!justification) throw new ValidationException([{ field: 'justification', code: 'required' }]);
    const created = await this.repo.create(
      scopeOf(p), serviceId,
      { testId: dto.test_id, assetId: dto.asset_id, justification, technicalJustification: dto.technical_justification?.trim() || null, proposedBy: p.userId },
      (done) => entry(p, meta, 'exclusion.request', null, snapshot(done)),
    );
    if (!created) throw new DomainError('NOT_FOUND');
    // Sin un consultor que la apruebe la exclusión espera y el activo sigue contando (P24, D83): la respuesta lo dice para que la pantalla lo avise.
    return { exclusion: created, awaitingConsultant: !(await this.repo.hasActiveConsultant(scopeOf(p))) };
  }
}

@Injectable()
export class DecideExclusionUseCase {
  constructor(private readonly repo: ExclusionRepository) {}

  async execute(p: Principal, id: string, dto: DecideExclusionDto, meta: RequestMeta): Promise<ExclusionView> {
    const note = dto.decision_note?.trim() || null;
    // Rechazar sin decir por qué no deja rastro de la razón: el motivo es obligatorio.
    if (dto.status === 'rejected' && !note) throw new ValidationException([{ field: 'decision_note', code: 'note.required' }]);
    const done = await this.repo.decide(scopeOf(p), id, { status: dto.status, note, decidedBy: p.userId, meta }, (change) =>
      entry(p, meta, 'exclusion.decide', snapshot(change.before), snapshot(change.after)),
    );
    if (!done) throw new DomainError('NOT_FOUND');
    return { exclusion: done.after, awaitingConsultant: false };
  }
}
