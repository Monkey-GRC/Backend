import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { TestVerdictRepository, VerdictIssued, VerdictRecord } from '../../domain/repositories/test-verdict.repository';
import { IssueVerdictDto } from '../dtos/verdict.dto';

// MD-155 · D85 · El veredicto de un test manual que no es documental. Solo el consultor lo da (lo impone @Roles en la ruta) y cuenta en todos los controles del servicio que
// llevan el test. Una documental se resuelve revisando su evidencia (D88) y una automática la mide la sonda: ambas responden 409. La IA puede sugerir, pero esta ruta no la
// recibe: el veredicto lo da una persona y queda con quién lo confirmó.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const text = (value: string | null | undefined) => value?.trim() || null;

@Injectable()
export class IssueVerdictUseCase {
  constructor(private readonly repo: TestVerdictRepository) {}

  async execute(p: Principal, controlId: string, testId: string, dto: IssueVerdictDto, meta: RequestMeta): Promise<VerdictIssued> {
    const issued = await this.repo.issue(
      scopeOf(p), controlId, testId,
      { result: dto.result, note: text(dto.note), closureObservationReason: text(dto.closure_observation_reason), confirmedBy: p.userId, meta },
      (done): AuditEntry => ({
        tenantId: p.companyId, userId: p.userId, action: 'test_verdict.issue', resource: 'evaluation', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
        beforeState: null,
        afterState: {
          id: done.id, control_id: done.controlId, test_id: done.testId, dimension: done.dimension, result: done.result, test_state: done.testState,
          applies_to_controls: done.appliesToControls.map((c) => c.code), closure_observation_reason: done.closureObservationReason,
        },
      }),
    );
    if (!issued) throw new DomainError('NOT_FOUND');
    return issued;
  }
}

@Injectable()
export class ListVerdictsUseCase {
  constructor(private readonly repo: TestVerdictRepository) {}

  async execute(p: Principal, controlId: string, testId: string, page: number, pageSize: number): Promise<Page<VerdictRecord>> {
    const found = await this.repo.list(scopeOf(p), controlId, testId, page, pageSize);
    if (!found) throw new DomainError('NOT_FOUND');
    return found;
  }
}
