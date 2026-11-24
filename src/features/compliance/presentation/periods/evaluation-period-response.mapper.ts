import { EvaluationPeriodRow } from '../../domain/periods/evaluation-period.repository';
import { EvaluationPeriodView } from '../../application/periods/evaluation-period.use-cases';

const day = (d: Date) => d.toISOString().slice(0, 10);

// Forma de contracts/modules/compliance-overview.md → `PUT …/evaluation-period` (D87).
export const toEvaluationPeriod = (v: EvaluationPeriodView) => ({
  framework_code: v.frameworkCode,
  catalog_version: String(v.catalogVersion),
  period_start: day(v.periodStart),
  period_end: day(v.periodEnd),
  cutoff_date: day(v.cutoff.date),
  cutoff_frozen: v.cutoff.frozen,
});

// Forma de contracts/cumplimiento/resumen.md → `GET …/evaluation-periods` (D145, D148).
export const toEvaluationPeriodItem = (r: EvaluationPeriodRow) => ({
  id: r.id,
  status: r.status,
  period_start: day(r.periodStart),
  period_end: day(r.periodEnd),
  cutoff_date: r.cutoffDate ? day(r.cutoffDate) : null,
  opened_by: r.openedBy,
  closed_at: r.closedAt ? r.closedAt.toISOString() : null,
});
