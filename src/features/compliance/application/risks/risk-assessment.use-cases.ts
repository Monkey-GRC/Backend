import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { EvaluationEntry, RiskEvaluation, RiskRepository, RiskTreatmentRecord } from '../../domain/risks/risk.repository';
import { riskLevelOf, riskValueOf } from '../../domain/risks/risk-types';
import { CreateTreatmentDto, EvaluateRiskDto } from './risk-assessment.dto';
import { parseDueDate, validateEvaluation } from './risk-assessment.validation';
import { GetRiskUseCase } from './risk.use-cases';

// MD-123 · Evaluar un riesgo en la matriz 5×5 y registrar su tratamiento. Evalúa y trata solo `admin_empresa` (lo impone @Can en la ruta); el
// auditor lee. El valor y el nivel los calcula el servidor: el cliente nunca.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const snapshot = (riskId: string, e: RiskEvaluation) => ({
  risk_id: riskId, likelihood: e.likelihood, impact: e.impact, inherent_risk_value: e.inherentRiskValue, inherent_risk_level: e.inherentRiskLevel,
});
const entry = (p: Principal, meta: RequestMeta, action: string, resource: string, before: unknown, after: unknown): AuditEntry => ({
  tenantId: p.companyId, userId: p.userId, action, resource, result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
  beforeState: (before as Record<string, unknown>) ?? null, afterState: (after as Record<string, unknown>) ?? null,
});

@Injectable()
export class EvaluateRiskUseCase {
  constructor(private readonly repo: RiskRepository) {}

  async execute(p: Principal, riskId: string, dto: EvaluateRiskDto, meta: RequestMeta): Promise<EvaluationEntry> {
    validateEvaluation(dto.likelihood, dto.impact);
    const value = riskValueOf(dto.likelihood, dto.impact);
    const next = { likelihood: dto.likelihood, impact: dto.impact, inherentRiskValue: value, inherentRiskLevel: riskLevelOf(value), evaluatedBy: p.userId };

    const done = await this.repo.evaluateRisk(scopeOf(p), riskId, next, (change) =>
      entry(p, meta, 'client_risk.evaluate', 'client_risk', snapshot(riskId, change.before), snapshot(riskId, change.after)),
    );
    if (!done) throw new DomainError('NOT_FOUND');
    return {
      riskId,
      current: { likelihood: next.likelihood, impact: next.impact, inherentRiskValue: next.inherentRiskValue, inherentRiskLevel: next.inherentRiskLevel },
      // La primera evaluación no tiene valor previo.
      previous: done.before.likelihood !== null ? done.before : null,
      evaluatedBy: done.evaluatedBy,
      evaluatedAt: done.evaluatedAt,
    };
  }
}

@Injectable()
export class EvaluationHistoryUseCase {
  constructor(private readonly repo: RiskRepository) {}

  async execute(p: Principal, riskId: string, page: { page: number; pageSize: number }): Promise<Page<EvaluationEntry>> {
    const history = await this.repo.evaluationHistory(scopeOf(p), riskId, page);
    if (!history) throw new DomainError('NOT_FOUND');
    return history;
  }
}

@Injectable()
export class CreateTreatmentUseCase {
  constructor(private readonly repo: RiskRepository) {}

  async execute(p: Principal, riskId: string, dto: CreateTreatmentDto, meta: RequestMeta): Promise<RiskTreatmentRecord> {
    const dueDate = parseDueDate(dto.due_date);
    const created = await this.repo.createTreatment(scopeOf(p), riskId, { decision: dto.decision, responsibleId: dto.responsible_id, dueDate, createdBy: p.userId }, (done) =>
      entry(p, meta, 'risk_treatment.create', 'risk_treatment', null, {
        id: done.id, risk_id: done.riskId, decision: done.decision, responsible_id: done.responsible.id, due_date: done.dueDate.toISOString().slice(0, 10),
      }),
    );
    if (!created) throw new DomainError('NOT_FOUND');
    return created;
  }
}

// Quien puede leer el riesgo puede leer su historial de tratamientos (el `responsable`, solo si el riesgo llega a una acción suya).
@Injectable()
export class ListTreatmentsUseCase {
  constructor(private readonly repo: RiskRepository, private readonly getRisk: GetRiskUseCase) {}

  async execute(p: Principal, riskId: string, page: { page: number; pageSize: number }): Promise<Page<RiskTreatmentRecord>> {
    await this.getRisk.execute(p, riskId, undefined);
    const treatments = await this.repo.listTreatments(scopeOf(p), riskId, page);
    if (!treatments) throw new DomainError('NOT_FOUND');
    return treatments;
  }
}
