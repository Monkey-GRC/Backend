import { EvaluationPeriodView } from '../application/use-cases/evaluation-period.use-cases';

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
