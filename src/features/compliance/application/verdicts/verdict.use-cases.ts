import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { canSeeControl } from '../../domain/controls/control-access';
import { reviewerRoleFor } from '../../domain/evidence/evidence';
import { bornApproved, canRegisterVerdict } from '../../domain/verdicts/test-verdict';
import { TestVerdictRepository, VerdictRecord, VerdictWithTestState } from '../../domain/verdicts/test-verdict.repository';
import { IssueVerdictDto, ReviewVerdictDto } from './verdict.dto';

// D102, D121 · El veredicto de una prueba manual que no es documental se REGISTRA (el ejecutor, el dueño o el admin_empresa) y se REVISA (el dueño, si no lo registró él, y el admin_empresa).
// Nace `pending` y no cuenta hasta que alguien lo apruebe; si lo registra el admin_empresa nace con su aprobación (P34). Es del test en el servicio y cuenta en todos los controles que lo
// llevan. Una documental se resuelve revisando su evidencia (D88) y una automática la mide la sonda: ambas responden 409. La IA puede sugerir, pero estas rutas no la reciben.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const text = (value: string | null | undefined) => value?.trim() || null;

@Injectable()
export class IssueVerdictUseCase {
  constructor(private readonly repo: TestVerdictRepository) {}

  async execute(p: Principal, controlId: string, testId: string, dto: IssueVerdictDto, meta: RequestMeta): Promise<VerdictWithTestState> {
    // Primero dónde está el control y a quién le toca: uno ajeno o inexistente es 404; de su empresa pero que no atiende, 403.
    const origin = await this.repo.originOf(scopeOf(p), controlId, testId);
    if (!origin) throw new DomainError('NOT_FOUND');
    if (!canRegisterVerdict(p, origin.access)) throw new DomainError('FORBIDDEN');

    const issued = await this.repo.issue(
      scopeOf(p), controlId, testId,
      { result: dto.result, note: text(dto.note), closureObservationReason: text(dto.closure_observation_reason), registeredBy: p.userId, approvedAtBirth: bornApproved(p), meta },
      (done): AuditEntry => ({
        tenantId: p.companyId, userId: p.userId, action: 'test_verdict.issue', resource: 'test_verdict', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
        beforeState: null,
        afterState: {
          id: done.id, control_id: done.controlId, test_id: done.testId, dimension: done.dimension, result: done.result, verdict_state: done.state, test_state: done.testState,
          registered_by: done.registeredBy.id, registered_by_role: done.registeredBy.role, applies_to_controls: done.appliesToControls.map((c) => c.code),
          closure_observation_reason: done.closureObservationReason,
        },
      }),
    );
    if (!issued) throw new DomainError('NOT_FOUND');
    return issued;
  }
}

@Injectable()
export class ReviewVerdictUseCase {
  constructor(private readonly repo: TestVerdictRepository) {}

  async execute(p: Principal, verdictId: string, dto: ReviewVerdictDto, meta: RequestMeta): Promise<VerdictWithTestState> {
    const found = await this.repo.findForReview(scopeOf(p), verdictId);
    if (!found) throw new DomainError('NOT_FOUND');
    // El rol lo fija el servidor: el admin_empresa siempre; el dueño solo si no lo registró él. El ejecutor, el auditor y un responsable ajeno, 403.
    const reviewerRole = reviewerRoleFor(p, found.access, found.verdict.registeredBy.id);
    if (!reviewerRole) throw new DomainError('FORBIDDEN');
    if (found.superseded) throw new DomainError('VERDICT_SUPERSEDED');
    const note = text(dto.note);
    if (dto.decision === 'reject' && !note) throw new ValidationException([{ field: 'note', code: 'note.required' }]);

    const saved = await this.repo.saveReview(
      scopeOf(p), verdictId, { reviewerRole, decision: dto.decision, note, reviewedBy: p.userId, meta },
      // Quién registró y quién revisa quedan en el rastro, con su rol; la nota de la revisión no viaja en el detalle.
      (done): AuditEntry => ({
        tenantId: p.companyId, userId: p.userId, action: 'test_verdict.review', resource: 'test_verdict_review', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
        beforeState: done.before ? { verdict_id: done.verdict.id, reviewer_role: reviewerRole, decision: done.before.decision, verdict_state: done.stateBefore } : { verdict_id: done.verdict.id, verdict_state: done.stateBefore },
        afterState: {
          verdict_id: done.verdict.id, control_id: done.verdict.controlId, test_id: done.verdict.testId, result: done.verdict.result, reviewer_role: reviewerRole, decision: done.after.decision,
          registered_by: done.verdict.registeredBy.id, verdict_state: done.verdict.state, test_state: done.verdict.testState,
        },
      }),
    );
    if (!saved) throw new DomainError('NOT_FOUND');
    return saved.verdict;
  }
}

@Injectable()
export class ListVerdictsUseCase {
  constructor(private readonly repo: TestVerdictRepository) {}

  async execute(p: Principal, controlId: string, testId: string, page: number, pageSize: number): Promise<Page<VerdictRecord>> {
    const found = await this.repo.list(scopeOf(p), controlId, testId, page, pageSize);
    if (!found) throw new DomainError('NOT_FOUND');
    // El dueño y el ejecutor leen el historial de los controles que atienden (D102); un responsable o delegado ajeno, 403.
    if (!canSeeControl(p, found.access)) throw new DomainError('FORBIDDEN');
    return found.page;
  }
}
