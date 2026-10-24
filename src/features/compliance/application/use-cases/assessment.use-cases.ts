import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { utcDay } from '../../domain/evaluation-period';
import { AssessmentFilters, AssessmentRecord, AssessorRole, FrameworkAssessmentRepository, VERDICTS_OF } from '../../domain/repositories/framework-assessment.repository';
import { IssueAssessmentDto } from '../dtos/assessment.dto';

// MD-155 · D77 · La evaluación del consultor (lista o no lista para la auditoría) y la del auditor (certifica o no). Cada rol emite solo la suya (SEG-56): el rol sale de la
// sesión y emitir el valor del otro rol es 403. Una vez emitida no se edita ni se borra; la vigente es la última de ese rol. No cambia el estado calculado.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const day = (d: Date) => d.toISOString().slice(0, 10);

/** El rol que emite, o 403: solo el consultor y el auditor tienen evaluación. */
export function assessorRoleOf(p: Principal): AssessorRole {
  if (p.role === 'consultor' || p.role === 'auditor') return p.role;
  throw new DomainError('FORBIDDEN');
}

@Injectable()
export class IssueAssessmentUseCase {
  constructor(private readonly repo: FrameworkAssessmentRepository) {}

  async execute(p: Principal, serviceId: string, frameworkCode: string, dto: IssueAssessmentDto, meta: RequestMeta, now: Date = new Date()): Promise<AssessmentRecord> {
    const assessorRole = assessorRoleOf(p);
    // El valor del otro rol existe pero no le toca: emitir la evaluación del otro es 403 (SEG-56). Un valor que no existe ya lo rechazó la validación del cuerpo (422).
    if (!VERDICTS_OF[assessorRole].includes(dto.verdict)) throw new DomainError('FORBIDDEN');
    const issued = await this.repo.issue(
      scopeOf(p), serviceId, frameworkCode,
      { assessorRole, verdict: dto.verdict, rationale: dto.rationale.trim(), issuedBy: p.userId, today: utcDay(now) },
      (done): AuditEntry => ({
        tenantId: p.companyId, userId: p.userId, action: 'framework_assessment.issue', resource: 'framework_assessment', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
        beforeState: null,
        afterState: {
          id: done.id, service_id: done.serviceId, framework_code: done.frameworkCode, assessor_role: done.assessorRole, verdict: done.verdict,
          evaluation: { catalog_version: done.evaluation.catalogVersion, period_start: day(done.evaluation.periodStart), period_end: day(done.evaluation.periodEnd), cutoff_date: day(done.evaluation.cutoffDate) },
        },
      }),
    );
    if (!issued) throw new DomainError('NOT_FOUND');
    return issued;
  }
}

@Injectable()
export class ListAssessmentsUseCase {
  constructor(private readonly repo: FrameworkAssessmentRepository) {}

  async execute(p: Principal, serviceId: string, frameworkCode: string, filters: AssessmentFilters, page: number, pageSize: number): Promise<Page<AssessmentRecord>> {
    assessorRoleOf(p);
    const found = await this.repo.list(scopeOf(p), serviceId, frameworkCode, filters, page, pageSize);
    if (!found) throw new DomainError('NOT_FOUND');
    return found;
  }
}
