import { AssessmentRecord } from '../domain/repositories/framework-assessment.repository';
import { AssessmentResponse } from './assessment.responses';

const day = (d: Date) => d.toISOString().slice(0, 10);

export const toAssessment = (a: AssessmentRecord): AssessmentResponse => ({
  id: a.id, service_id: a.serviceId, framework_code: a.frameworkCode, assessor_role: a.assessorRole, verdict: a.verdict, rationale: a.rationale,
  evaluation: { catalog_version: String(a.evaluation.catalogVersion), period_start: day(a.evaluation.periodStart), period_end: day(a.evaluation.periodEnd), cutoff_date: day(a.evaluation.cutoffDate) },
  issued_by: { id: a.issuedBy.id, name: a.issuedBy.name, last_name: a.issuedBy.lastName }, issued_at: a.issuedAt.toISOString(), is_current: a.isCurrent,
});
