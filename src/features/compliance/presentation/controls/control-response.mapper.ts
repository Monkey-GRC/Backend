import { I18nContext } from 'nestjs-i18n';
import { localizedTestName, TestNames } from '../../../../common/text/test-display-name';
import { ControlAccess } from '../../domain/controls/control-access';
import { ControlReadout, Dimension } from '../../domain/controls/control-readout';
import { ControlDetail } from '../../application/controls/get-control.use-case';
import { codeOfControl } from '../../domain/overview/compliance-overview';

// Forma de contracts/modules/compliance-controls.md. La vista de negocio lleva el código del control y el de sus requisitos (D80), pero no el texto de una prueba
// ni al proveedor del motor; `technical` solo se agrega cuando el caso de uso ya comprobó que el rol puede pedirla.
type Translate = (key: string) => string;

// Un test sin nombre neutro (D70) se muestra con un texto genérico de su dimensión: nunca el nombre del comité.
// El nombre sale en el idioma de la petición (`display_name_en` si existe, si no el español).
export const neutralName = (test: TestNames, dimension: Dimension, t: Translate) => localizedTestName(test, I18nContext.current()?.lang) ?? t(`control.test.${dimension}`);

const party = (p: ControlAccess['owner']) => (p ? { id: p.id, name: p.name, last_name: p.lastName, role: p.role } : null);

const base = (r: ControlReadout) => ({
  id: r.control.id,
  // D80: el código se muestra siempre, el del catálogo (`IAC-12`) o el propio (`C01`). `own_code` es solo la numeración de los controles propios.
  code: codeOfControl(r),
  requirement_codes: r.control.requirementCodes,
  own_code: r.control.origin === 'own' ? r.control.ownCode : null,
  name: r.control.name,
  origin: r.control.origin,
  type: r.control.type,
  trust_criteria: r.control.trustCriteria,
  approval: r.approval,
  readiness: r.readiness,
  progress: r.progress,
  coverage: r.coverage,
  owner: party(r.control.access.owner),
  executor: party(r.control.access.executor),
});

const technicalBlock = (r: ControlReadout) => ({
  points_of_focus: r.control.pointsOfFocus,
  control_state: r.state,
  level: r.level,
  level_value: r.levelValue,
  complies: r.complies,
  c_percent: r.cPercent,
  tests_count: r.tests.length,
  periodicity_change: r.control.periodicityChange
    ? { periodicity: r.control.periodicityChange.periodicity, justification: r.control.periodicityChange.justification, changed_at: r.control.periodicityChange.changedAt.toISOString() }
    : null,
  period: r.period
    ? {
        level: r.period.level,
        complies: r.period.complies,
        windows: { total: r.period.windows.total, with_evidence: r.period.windows.withEvidence },
        missing: r.period.missing.map((m) => ({ requirement_code: m.requirementCode, window_start: m.windowStart, window_end: m.windowEnd })),
      }
    : null,
});

const checksBlock = (c: { directPass: number; directFail: number; directException: number; noData: number; complementaryFail: number } | null) =>
  c ? { direct_pass: c.directPass, direct_fail: c.directFail, direct_exception: c.directException, no_data: c.noData, complementary_fail: c.complementaryFail } : null;

const requirementsBlock = (r: ControlReadout, t: Translate) =>
  r.requirements.map((x) => ({
    id: x.requirement.id,
    code: x.requirement.code,
    text: x.requirement.text,
    type: x.requirement.type,
    periodicity: x.requirement.periodicity,
    suggested_periodicity: x.requirement.suggestedPeriodicity ?? null,
    periodicity_source: r.control.periodicityChange ? 'client' : 'catalog',
    status: x.status,
    tests: x.tests.map((y) => ({
      test_id: y.test.testId,
      test_code: y.test.code,
      display_name: neutralName(y.test, y.test.dimension, t),
      status: y.status,
      window_end: y.windowEnd,
      alert_at: y.alertAt,
      checks: checksBlock(y.checks),
      asset_coverage: y.assetCoverage ? { with_result: y.assetCoverage.withResult, in_scope: y.assetCoverage.inScope } : null,
    })),
  }));

export const toControlListItem = (r: ControlReadout, technical: boolean) => ({ ...base(r), ...(technical ? { technical: technicalBlock(r) } : {}) });

export function toControlDetail(d: ControlDetail, t: Translate) {
  const r = d.readout;
  return {
    ...base(r),
    service_id: r.control.serviceId,
    interpretation: { text: r.control.interpretation, is_customized: r.control.catalogDescription === null || r.control.interpretation !== r.control.catalogDescription },
    dimensions: r.control.dimensions.map((x) => ({
      dimension: x.dimension,
      applies: x.applies,
      type: x.applies ? x.type : null,
      reason_not_applicable: x.reasonNotApplicable,
    })),
    evidence: d.evidence.map((e) => ({
      requirement_id: e.requirementId,
      description: e.description,
      responsible: e.responsible ? { id: e.responsible.id, type: e.responsible.type, person_name: e.responsible.personName } : null,
      latest_submission: e.latestSubmission ? { id: e.latestSubmission.id, version: e.latestSubmission.version, evidence_state: e.latestSubmission.evidenceState } : null,
    })),
    causes: d.causes,
    failing: r.failing.map((f) => ({
      dimension: f.dimension,
      affected: f.affected.map((a) => (a.kind === 'asset' ? { kind: 'asset', id: a.id, name: a.name } : { kind: 'test', id: a.id, display_name: neutralName(a, f.dimension, t) })),
    })),
    ...(d.view === 'technical'
      ? {
          technical: {
            ...technicalBlock(r),
            requirements: requirementsBlock(r, t),
            tests: r.tests.map((x) => ({ test_id: x.test.testId, test_code: x.test.code, display_name: neutralName(x.test, x.test.dimension, t), display_description: x.test.displayDescription, dimension: x.test.dimension, state: x.state })),
          },
        }
      : {}),
  };
}
