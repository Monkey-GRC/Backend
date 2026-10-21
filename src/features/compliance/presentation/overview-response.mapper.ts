import { OverviewCategory, OverviewFramework } from '../domain/compliance-overview';
import { neutralName } from './control-response.mapper';

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
      affected: x.affected.map((a) => (a.kind === 'asset' ? { kind: 'asset', id: a.id, name: a.name } : { kind: 'test', id: a.id, display_name: neutralName(a.displayName, x.dimension, t) })),
    })),
  })),
  ...(technical
    ? {
        technical: {
          state: c.technical.state,
          controls: c.technical.controls.map((l) => ({
            control_id: l.readout.control.id,
            control_code: l.code,
            state: l.readout.state,
            progress: l.readout.progress,
            blocking_tests: l.blockingTests.map((b) => ({ test_code: b.code, display_name: neutralName(b.displayName, b.dimension as never, t), state: b.state })),
          })),
        },
      }
    : {}),
});

export const toOverview = (serviceId: string, frameworks: OverviewFramework[], technical: boolean, t: Translate) => ({
  service_id: serviceId,
  frameworks: frameworks.map((f) => {
    // Sin período auditado (D87) no hay evaluación que mostrar: los cinco datos van en nulo. La fecha de corte efectiva ya viene calculada (hoy o la congelada).
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
          }
        : { catalog_version: null, period_start: null, period_end: null, cutoff_date: null, cutoff_frozen: null },
      categories: f.categories.map((c) => category(c, technical, t)),
      ...(technical
        ? {
            technical: {
              state: f.technical.state,
              unique_controls: f.technical.uniqueControls,
              failing: f.technical.failing,
              pending: f.technical.pending,
              // El veredicto del consultor y el del auditor (D77, MD-155) todavía no se guardan.
              assessments: { consultant: null, auditor: null },
            },
          }
        : {}),
    };
  }),
});
