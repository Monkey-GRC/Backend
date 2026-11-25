import { OverviewCategory, OverviewFramework } from '../../domain/overview/compliance-overview';
import { neutralName } from '../controls/control-response.mapper';

// Forma de contracts/modules/compliance-overview.md. `technical` solo se agrega cuando el caso de uso ya comprobó que el rol puede pedirla. Un test sale con su nombre
// neutro, nunca con el texto del comité ni con su código (D70) salvo en la vista técnica.
type Translate = (key: string) => string;

const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

const category = (c: OverviewCategory, technical: boolean, t: Translate) => ({
  trust_criterion: c.trustCriterion,
  readiness: c.readiness,
  progress: c.progress,
  coverage: c.coverage,
  failing_controls: c.failingControls.map((f) => ({
    control_id: f.readout.control.id,
    code: f.code,
    requirement_codes: f.requirementCodes,
    own_code: f.ownCode,
    name: f.readout.control.name,
    readiness: f.readout.readiness,
    failing: f.readout.failing.map((x) => ({
      dimension: x.dimension,
      affected: x.affected.map((a) => (a.kind === 'asset' ? { kind: 'asset', id: a.id, name: a.name } : { kind: 'test', id: a.id, display_name: neutralName(a, x.dimension, t) })),
    })),
  })),
  ...(technical
    ? {
        technical: {
          state: c.technical.state,
          controls: c.technical.controls.map((l) => ({
            control_id: l.readout.control.id,
            control_code: l.code,
            progress: l.readout.progress,
            level: l.readout.level,
            level_value: l.readout.levelValue,
            complies: l.readout.complies,
            c_percent: l.readout.cPercent,
            blocking_requirements: l.readout.blockingRequirements.map((b) => ({ code: b.requirement.code, text: b.requirement.text, status: b.status })),
          })),
        },
      }
    : {}),
});

export const toOverview = (serviceId: string, frameworks: OverviewFramework[], technical: boolean, t: Translate) => ({
  service_id: serviceId,
  frameworks: frameworks.map((f) => {
    // Sin período auditado (D87) no hay evaluación que mostrar: los cinco datos van en nulo (`min_period_months` siempre viaja). La fecha de corte efectiva ya viene calculada (hoy o la congelada).
    const defined = f.evaluation.periodStart !== null && f.evaluation.periodEnd !== null && f.evaluation.cutoffDate !== null;
    return {
      framework_code: f.frameworkCode,
      name: f.name,
      readiness: f.readiness,
      progress: f.progress,
      coverage: f.coverage,
      evaluation: defined
        ? {
            catalog_version: String(f.evaluation.catalogVersion),
            period_start: day(f.evaluation.periodStart),
            period_end: day(f.evaluation.periodEnd),
            cutoff_date: day(f.evaluation.cutoffDate),
            cutoff_frozen: f.evaluation.cutoffFrozen,
            min_period_months: f.evaluation.minPeriodMonths,
          }
        : { catalog_version: null, period_start: null, period_end: null, cutoff_date: null, cutoff_frozen: null, min_period_months: f.evaluation.minPeriodMonths },
      categories: f.categories.map((c) => category(c, technical, t)),
      ...(technical
        ? {
            technical: {
              state: f.technical.state,
              unique_controls: f.technical.uniqueControls,
              failing: f.technical.failing,
              pending: f.technical.pending,
            },
          }
        : {}),
    };
  }),
});
