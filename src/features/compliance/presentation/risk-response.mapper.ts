import { CauseNode, ControlLink, EvaluationEntry, RiskGraph, RiskNode, RiskTreatmentRecord } from '../domain/repositories/risk.repository';
import { lossTypesOf } from '../domain/risk-types';
import { activeCauses, activeRisks } from '../application/use-cases/risk.use-cases';

// Forma de contracts/modules/compliance-risks.md. `technical` solo se agrega cuando el caso de uso ya comprobó que el rol puede pedirlo.
const technical = (on: boolean, code: string | null) => (on ? { technical: { catalog_code: code } } : {});

const controlLink = (k: ControlLink, on: boolean) => ({
  control_id: k.controlId,
  // El código del catálogo es técnico: un control del catálogo se identifica por su nombre; `own_code` es solo de los propios.
  own_code: k.origin === 'own' ? k.ownCode : null,
  name: k.name,
  is_mandatory: k.isMandatory,
  effect: k.effect,
  ...technical(on, k.catalogCode),
});

const evaluation = (r: RiskNode) => ({
  likelihood: r.likelihood, impact: r.impact, inherent_risk_value: r.inherentRiskValue, inherent_risk_level: r.inherentRiskLevel,
});

const day = (d: Date) => d.toISOString().slice(0, 10);
const responsible = (r: RiskTreatmentRecord['responsible']) => ({ id: r.id, type: r.type, person_name: r.personName });

// La decisión vigente de un riesgo dentro de su lista y su detalle; el historial completo es `GET /risks/{id}/treatments`.
const currentTreatment = (r: RiskNode) => (r.treatment ? { decision: r.treatment.decision, due_date: day(r.treatment.dueDate), responsible: responsible(r.treatment.responsible) } : null);

export const toRiskTreatment = (t: RiskTreatmentRecord) => ({
  id: t.id, risk_id: t.riskId, decision: t.decision, responsible: responsible(t.responsible), due_date: day(t.dueDate), created_at: t.createdAt.toISOString(),
});

const person = (p: NonNullable<EvaluationEntry['evaluatedBy']>) => ({ id: p.id, name: p.name, last_name: p.lastName });
export const toEvaluationEntry = (e: EvaluationEntry) => ({
  risk_id: e.riskId,
  likelihood: e.current.likelihood,
  impact: e.current.impact,
  inherent_risk_value: e.current.inherentRiskValue,
  inherent_risk_level: e.current.inherentRiskLevel,
  previous: e.previous
    ? { likelihood: e.previous.likelihood, impact: e.previous.impact, inherent_risk_value: e.previous.inherentRiskValue, inherent_risk_level: e.previous.inherentRiskLevel }
    : null,
  evaluated_by: e.evaluatedBy ? person(e.evaluatedBy) : null,
  evaluated_at: e.evaluatedAt.toISOString(),
});

export const toRiskListItem = (r: RiskNode, g: RiskGraph, on: boolean) => ({
  id: r.id, code: r.code, name: r.name, trust_criterion: r.trustCriterion, origin: r.origin, is_active: r.isActive, ...evaluation(r),
  treatment: currentTreatment(r),
  causes_count: activeCauses(g, r).length,
  ...technical(on, r.origin === 'catalog' ? r.code : null),
});

export const toRiskDetail = (r: RiskNode, g: RiskGraph, on: boolean) => ({
  id: r.id, service_id: r.serviceId, code: r.code, name: r.name, description: r.description, trust_criterion: r.trustCriterion,
  potential_impact: lossTypesOf(r.potentialImpact), origin: r.origin, is_active: r.isActive, ...evaluation(r), treatment: currentTreatment(r),
  causes: activeCauses(g, r).map((c) => ({
    id: c.id, code: c.code, name: c.name, failure_category: c.failureCategory,
    controls: c.controls.map((k) => controlLink(k, on)),
    ...technical(on, c.origin === 'catalog' ? c.code : null),
  })),
  ...technical(on, r.origin === 'catalog' ? r.code : null),
});

export const toCause = (c: CauseNode, g: RiskGraph, on: boolean) => ({
  id: c.id, service_id: c.serviceId, code: c.code, name: c.name, description: c.description, failure_category: c.failureCategory, origin: c.origin, is_active: c.isActive,
  risks: activeRisks(g, c).map((r) => ({ id: r.id, code: r.code, name: r.name })),
  controls: c.controls.map((k) => controlLink(k, on)),
  ...technical(on, c.origin === 'catalog' ? c.code : null),
});
