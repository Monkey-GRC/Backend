import { I18nContext } from 'nestjs-i18n';
import { publicText } from '../../../../common/text/provider-names';
import { localizedTestName, TestNames } from '../../../../common/text/test-display-name';
import { ControlDetail } from '../../application/controls/get-control.use-case';
import { ControlAccess } from '../../domain/controls/control-access';
import { CheckLinkReadout, ControlReadout, Dimension } from '../../domain/controls/control-readout';
import { ConnectedIntegrationCategories, evidenceAcceptanceOf, EvidenceSourceTest } from '../../domain/evidence/test-evidence-source';
import { codeOfControl } from '../../domain/overview/compliance-overview';

const evidenceFlags = (test: EvidenceSourceTest, connected: ConnectedIntegrationCategories, applies: boolean) => {
  const { accepts, fallback } = evidenceAcceptanceOf(test, connected, applies);
  return { accepts_evidence: accepts, evidence_fallback: fallback };
};

// Forma de contracts/modules/compliance-controls.md. La vista de negocio lleva el código del control y el de sus requisitos (D80), pero no el texto de una prueba
// ni al proveedor del motor; `technical` solo se agrega cuando el caso de uso ya comprobó que el rol puede pedirla.
type Translate = (key: string) => string;

/** MD-499 · Las pruebas del control que aceptan evidencia, para todos los roles: del mismo readout y de la regla única (`evidenceAcceptanceOf`); sin checks ni niveles (§9). */
export function evidenceTestsOf(
  tests: ControlReadout['tests'], evidence: ReadonlyArray<{ requirementId: string; testId: string | null }>, connected: ConnectedIntegrationCategories, applying: ReadonlySet<string>, nameOf: (test: ControlReadout['tests'][number]['test']) => string,
) {
  const requirementOf = new Map(evidence.filter((e) => e.testId).map((e) => [e.testId as string, e.requirementId]));
  return tests.flatMap((x) => {
    const { accepts, fallback } = evidenceAcceptanceOf(x.test, connected, applying.has(x.test.dimension));
    return accepts
      ? [{ test_id: x.test.testId, test_code: x.test.code, display_name: nameOf(x.test), dimension: x.test.dimension, status: x.status, evidence_fallback: fallback, requirement_id: requirementOf.get(x.test.testId) ?? null }]
      : [];
  });
}

// Un test sin nombre neutro (D70) se muestra con un texto genérico de su dimensión: nunca el nombre del comité.
// El nombre sale en el idioma de la petición (`display_name_en` si existe, si no el español).
export const neutralName = (test: TestNames, dimension: Dimension, t: Translate) => localizedTestName(test, I18nContext.current()?.lang) ?? t(`control.test.${dimension}`);

const party = (p: ControlAccess['owner']) => (p ? { id: p.id, name: p.name, last_name: p.lastName, role: p.role } : null);

const personOf = (p: { id: string; name: string | null; lastName: string | null } | null | undefined) => (p ? { id: p.id, name: p.name, last_name: p.lastName } : null);

// MD-504 · El estado de gestión y quién aprobó o devolvió (solo lo vigente). `approval` (el alta del control propio) no cambia.
const managementBlock = (r: ControlReadout) => ({
  owner_approved_by: personOf(r.management.ownerApproved?.by),
  owner_approved_at: r.management.ownerApproved?.at.toISOString() ?? null,
  approved_by: personOf(r.management.approved?.by),
  approved_at: r.management.approved?.at.toISOString() ?? null,
  returned_reason: r.management.returned?.reason ?? null,
  returned_by: personOf(r.management.returned?.by),
  returned_at: r.management.returned?.at.toISOString() ?? null,
});

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
  management_state: r.managementState,
  management: managementBlock(r),
  readiness: r.readiness,
  progress: r.progress,
  coverage: r.coverage,
  owner: party(r.control.access.owner),
  executor: party(r.control.access.executor),
});

const technicalBlock = (r: ControlReadout) => ({
  points_of_focus: r.control.pointsOfFocus,
  level: r.level,
  level_value: r.levelValue,
  complies: r.complies,
  c_percent: r.cPercent,
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

// El título del check en el idioma de la petición (`title_es` y, sin traducción, `title_en`), siempre por `publicText` (SEG-39): un título que nombra al proveedor no sale; en su lugar,
// uno neutro. Nunca la plataforma, la política ni el identificador del check (regla 1).
export const checkTitleOf = (c: { titleEs: string | null; titleEn: string }, english: boolean, neutral: string): string =>
  (english ? null : publicText(c.titleEs?.trim())) ?? publicText(c.titleEn?.trim()) ?? neutral;

const checkTitle = (c: { titleEs: string | null; titleEn: string }, t: Translate) =>
  checkTitleOf(c, I18nContext.current()?.lang?.toLowerCase().startsWith('en') === true, t('control.check_link.neutral_title'));

const checkLinkBlock = (l: CheckLinkReadout, t: Translate) => ({
  role: l.role,
  kind: l.kind,
  check: l.check ? { id: l.check.id, title: checkTitle(l.check, t) } : null,
  module: l.module,
  failing_assets: l.failingAssets,
  owner: l.owner ? { control_id: l.owner.controlId, control_code: l.owner.controlCode, test_status: l.owner.testStatus } : null,
});

const applyingOf = (r: ControlReadout): ReadonlySet<string> => new Set(r.control.dimensions.filter((x) => x.applies).map((x) => x.dimension));

const requirementsBlock = (r: ControlReadout, t: Translate, links: ReadonlyMap<string, CheckLinkReadout[]>, connected: ConnectedIntegrationCategories, applying: ReadonlySet<string>) =>
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
      check_links: (links.get(y.test.testId) ?? []).map((l) => checkLinkBlock(l, t)),
      ...evidenceFlags(y.test, connected, applying.has(y.test.dimension)),
    })),
  }));

export const toControlListItem = (r: ControlReadout, technical: boolean) => ({ ...base(r), ...(technical ? { technical: technicalBlock(r) } : {}) });

export function toControlDetail(d: ControlDetail, t: Translate) {
  const r = d.readout;
  const applying = applyingOf(r);
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
    evidence_tests: evidenceTestsOf(r.tests, d.evidence, d.connectedIntegrations, applying, (x) => neutralName(x, x.dimension, t)),
    causes: d.causes,
    failing: r.failing.map((f) => ({
      dimension: f.dimension,
      affected: f.affected.map((a) => (a.kind === 'asset' ? { kind: 'asset', id: a.id, name: a.name } : { kind: 'test', id: a.id, display_name: neutralName(a, f.dimension, t) })),
    })),
    ...(d.view === 'technical'
      ? {
          technical: {
            ...technicalBlock(r),
            requirements: requirementsBlock(r, t, d.checkLinks, d.connectedIntegrations, applying),
            tests: r.tests.map((x) => ({ test_id: x.test.testId, test_code: x.test.code, display_name: neutralName(x.test, x.test.dimension, t), display_description: x.test.displayDescription, dimension: x.test.dimension, ...evidenceFlags(x.test, d.connectedIntegrations, applying.has(x.test.dimension)), status: x.status })),
          },
        }
      : {}),
  };
}
