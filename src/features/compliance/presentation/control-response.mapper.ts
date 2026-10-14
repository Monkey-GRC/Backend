import { ControlReadout, Dimension } from '../domain/control-readout';
import { ControlDetail } from '../application/use-cases/get-control.use-case';

// Forma de contracts/modules/compliance-controls.md. La vista de negocio no lleva códigos del catálogo, ni el texto de una prueba, ni al proveedor del
// motor; `technical` solo se agrega cuando el caso de uso ya comprobó que el rol puede pedirla.
type Translate = (key: string) => string;

// Un test sin nombre neutro (D70) se muestra con un texto genérico de su dimensión: nunca el nombre del comité.
const neutralName = (displayName: string | null, dimension: Dimension, t: Translate) => displayName ?? t(`control.test.${dimension}`);

const assignee = (a: ControlReadout['control']['assignee']) => (a ? { user_id: a.userId, name: a.name, last_name: a.lastName } : null);

const base = (r: ControlReadout) => ({
  id: r.control.id,
  // El código del catálogo (`IAC-12`) es técnico: en un control del catálogo viaja solo en `technical.control_code`. `own_code` es la numeración de los controles propios (`C01`).
  own_code: r.control.origin === 'own' ? r.control.ownCode : null,
  name: r.control.name,
  origin: r.control.origin,
  type: r.control.type,
  trust_criteria: r.control.trustCriteria,
  approval: r.approval,
  readiness: r.readiness,
  progress: r.progress,
  coverage: r.coverage,
  assigned_to: assignee(r.control.assignee),
  has_pending_change: r.hasPendingChange,
});

const technicalBlock = (r: ControlReadout) => ({
  control_code: r.control.catalogCode,
  requirement_codes: r.control.requirementCodes,
  points_of_focus: r.control.pointsOfFocus,
  control_state: r.state,
  tests_count: r.tests.length,
});

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
      latest_submission: e.latestSubmission ? { id: e.latestSubmission.id, version: e.latestSubmission.version, validation_status: e.latestSubmission.validationStatus } : null,
    })),
    causes: d.causes,
    failing: r.failing.map((f) => ({
      dimension: f.dimension,
      affected: f.affected.map((a) => (a.kind === 'asset' ? { kind: 'asset', id: a.id, name: a.name } : { kind: 'test', id: a.id, display_name: neutralName(a.displayName, f.dimension, t) })),
    })),
    ...(d.view === 'technical'
      ? {
          technical: {
            ...technicalBlock(r),
            tests: r.tests.map((x) => ({ test_code: x.test.code, display_name: neutralName(x.test.displayName, x.test.dimension, t), dimension: x.test.dimension, state: x.state })),
          },
        }
      : {}),
  };
}

// Una propuesta de cambio (contracts/modules/compliance-controls.md).
type ChangeView = import('../domain/repositories/control-change.repository').ControlChange;
const person = (p: { id: string; name: string | null; lastName: string | null }) => ({ id: p.id, name: p.name, last_name: p.lastName });

export const toControlChange = (c: ChangeView) => ({
  id: c.id,
  control_id: c.controlId,
  change_type: c.changeType,
  status: c.status,
  proposed_values: c.proposedValues,
  requested_by: person(c.requestedBy),
  requested_at: c.requestedAt.toISOString(),
  decided_by: c.decidedBy ? person(c.decidedBy) : null,
  decision_note: c.decisionNote,
  decided_at: c.decidedAt ? c.decidedAt.toISOString() : null,
});
