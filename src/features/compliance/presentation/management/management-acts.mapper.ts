import { isEventRequirement, type ControlReadout, type ReadoutTest } from '../../domain/controls/control-readout';
import {
  ApplicabilityRecord, isApplicabilityInForce, isValidRequest, LevelOverrideRecord, levelOfValue, OccurrenceRecord, DeclarationRecord, proposableLevels, RemediationPlanRecord, sameWindowStart, shownApplicabilityOf, shownOverrideOf,
  planOfTest,
} from '../../domain/controls/management-extras';
import type { PersonRef } from '../../domain/controls/management-state';
import { currentWindow } from '../../domain/engine/v2/windows';
import { Actor, allowedActionsOf, seesLevels, seesRequirements } from '../../domain/management/allowed-actions';

// MD-529 · Del dominio a la forma del contrato (contracts/cumplimiento/aprobacion.md). Los nombres de las pruebas llegan resueltos (`nameOf`): nunca el texto del comité.
export type NameOf = (test: ReadoutTest) => string;

const iso = (d: Date) => d.toISOString();
const day = (d: Date) => d.toISOString().slice(0, 10);
export const person = (p: PersonRef) => ({ id: p.id, name: p.name, last_name: p.lastName });
const maybePerson = (p: PersonRef | null) => (p ? person(p) : null);

export function toLevelOverride(o: LevelOverrideRecord, readout: ControlReadout, withState: boolean) {
  return {
    id: o.id, control_id: readout.control.id, suggested_level: levelOfValue(o.suggestedValue), proposed_level: levelOfValue(o.proposedValue), justification: o.justification, status: o.status,
    is_valid: isValidRequest(o, readout.suggestedLevelValue, readout.windowStart), proposed_by: person(o.proposedBy), proposed_at: iso(o.proposedAt), decided_by: maybePerson(o.decidedBy),
    decided_at: o.decidedAt ? iso(o.decidedAt) : null, decision_reason: o.decisionReason, ...(withState ? { management_state: readout.managementState } : {}),
  };
}

const testOf = (readout: ControlReadout, testId: string) => readout.tests.find((t) => t.test.testId === testId)?.test;
const isException = (readout: ControlReadout, testId: string) => readout.requirements.some((r) => r.requirement.isApplicable && r.tests.some((t) => t.test.testId === testId && t.status === 'exception'));

export function toPlan(p: RemediationPlanRecord, readout: ControlReadout, nameOf: NameOf, now: Date, withState: boolean) {
  const test = testOf(readout, p.testId);
  const requirement = readout.requirements.find((r) => r.requirement.id === p.requirementId || r.tests.some((t) => t.test.testId === p.testId))?.requirement;
  const open = isException(readout, p.testId);
  return {
    id: p.id, control_id: readout.control.id, test: { id: p.testId, code: test?.code ?? '', display_name: test ? nameOf(test) : '' }, requirement: requirement ? { id: requirement.id, code: requirement.code } : null,
    what: p.what, owner: person(p.assignee), due_date: day(p.dueDate), is_overdue: open && day(p.dueDate) < day(now), status: p.status,
    is_valid: p.invalidatedAt === null && sameWindowStart(p.windowStart, readout.windowStart) && open, proposed_by: person(p.proposedBy), proposed_at: iso(p.proposedAt),
    decided_by: maybePerson(p.decidedBy), decided_at: p.decidedAt ? iso(p.decidedAt) : null, decision_reason: p.decisionReason, ...(withState ? { management_state: readout.managementState } : {}),
  };
}

export function toApplicabilityRequest(a: ApplicabilityRecord, readout: ControlReadout, withState: boolean) {
  const r = readout.requirements.find((x) => x.requirement.id === a.requirementId)?.requirement;
  return {
    id: a.id, control_id: readout.control.id, requirement: { id: a.requirementId, code: r?.code ?? '', text: r?.text ?? '' }, reason: a.reason, status: a.status, requested_by: person(a.requestedBy),
    requested_at: iso(a.requestedAt), decided_by: maybePerson(a.decidedBy), decided_at: a.decidedAt ? iso(a.decidedAt) : null, decision_reason: a.decisionReason, reverted_by: maybePerson(a.revertedBy),
    reverted_at: a.revertedAt ? iso(a.revertedAt) : null, ...(withState ? { management_state: readout.managementState } : {}),
  };
}

export const toOccurrence = (o: OccurrenceRecord, requirement: { id: string; code: string }) => ({
  id: o.id, requirement: { id: requirement.id, code: requirement.code }, occurred_on: day(o.occurredOn), description: o.description, has_evidence: o.hasEvidence, evidence_count: o.evidenceCount,
  registered_by: person(o.registeredBy), registered_at: iso(o.registeredAt),
});

export const toDeclaration = (d: DeclarationRecord, requirement: { id: string; code: string }) => ({
  id: d.id, requirement: { id: requirement.id, code: requirement.code }, window_start: day(d.windowStart), window_end: day(d.windowEnd), note: d.note, declared_by: person(d.declaredBy), declared_at: iso(d.declaredAt),
});

/** El requisito del control al que sirve la prueba: el «cuando sea requerido» si hay alguno, si no el primero. */
export function requirementOfTest(readout: ControlReadout, testId: string): string | null {
  const own = readout.requirements.filter((r) => readout.control.origin !== 'own' && r.tests.some((t) => t.test.testId === testId));
  return (own.find((r) => isEventRequirement(r.requirement)) ?? own[0])?.requirement.id ?? null;
}

/** Lo que el detalle agrega a `management` (aprobacion.md, «El detalle del control»), para quien llama. */
export function detailManagement(readout: ControlReadout, actor: Actor, now: Date, nameOf: NameOf, acceptsEvidence: (test: ReadoutTest) => boolean) {
  const extras = readout.control.extras;
  const actions = allowedActionsOf(actor, readout, now);
  const levels = seesLevels(actor, readout);
  const shown = shownOverrideOf(extras?.overrides ?? [], readout.suggestedLevelValue, readout.windowStart);
  const quarter = currentWindow({ periodicity: 'quarterly', now });

  const exceptions: Array<{ test: ReadoutTest; requirementId: string; requirementCode: string }> = [];
  for (const r of readout.requirements) {
    if (!r.requirement.isApplicable || r.status === 'not_applicable') continue;
    for (const t of r.tests) if (t.status === 'exception' && !exceptions.some((e) => e.test.testId === t.test.testId)) exceptions.push({ test: t.test, requirementId: r.requirement.id, requirementCode: r.requirement.code });
  }

  const requirements = seesRequirements(actor, readout) && readout.control.origin !== 'own'
    ? readout.requirements.map((r) => {
        const req = r.requirement;
        const rows = extras?.applicability.get(req.id) ?? [];
        const shownRow = shownApplicabilityOf(rows);
        const applicability = !req.isApplicable ? 'not_applicable' : rows.some((x) => x.status === 'pending') ? 'not_applicable_pending' : 'applicable';
        const inQuarter = quarter ? (extras?.occurrences.get(req.id) ?? []).filter((o) => o.occurredOn >= quarter.start && o.occurredOn < quarter.end) : [];
        const declared = quarter ? (extras?.declarations.get(req.id) ?? []).some((d) => d.windowStart.getTime() === quarter.start.getTime()) : false;
        return {
          id: req.id, code: req.code, text: req.text, periodicity: req.periodicity, applicability,
          not_applicable: shownRow && (shownRow.status === 'pending' || isApplicabilityInForce(shownRow) || shownRow.status === 'rejected' || shownRow.revertedAt) ? toApplicabilityRequest(shownRow, readout, false) : null,
          on_demand: isEventRequirement(req) && quarter
            ? { window_start: day(quarter.start), window_end: day(new Date(quarter.end.getTime() - 86_400_000)), occurrences_count: inQuarter.length, occurrences_without_evidence: inQuarter.filter((o) => !o.hasEvidence).length, has_declaration: declared }
            : null,
          allowed_actions: actions.requirements.get(req.id) ?? [],
        };
      })
    : [];

  return {
    allowed_actions: actions.control,
    level: levels ? { suggested: readout.suggestedLevel, final: readout.level, is_corrected: readout.levelOverride !== null, allowed_levels: actions.control.includes('propose_level') ? proposableLevels(readout.suggestedLevelValue, readout.levelValue).map(levelOfValue) : [] } : null,
    level_override: levels && shown ? toLevelOverride(shown, readout, false) : null,
    exceptions: exceptions.map((e) => {
      const plan = planOfTest(extras?.plans ?? [], e.test.testId, readout.windowStart);
      return {
        test: { id: e.test.testId, code: e.test.code, display_name: nameOf(e.test) }, requirement: { id: e.requirementId, code: e.requirementCode }, plan: plan ? toPlan(plan, readout, nameOf, now, false) : null,
        allowed_actions: actions.exceptions.get(e.test.testId) ?? [],
      };
    }),
    requirements,
    manual_tests: readout.tests
      .filter((t) => t.manual && t.test.testType !== 'documentary')
      .map((t) => {
        const results = readout.control.manualResultHistory?.get(t.test.testId);
        const last = results && results.length > 0 ? results[results.length - 1] : (readout.control.manualResults?.get(t.test.testId) ?? null);
        return { test: { id: t.test.testId, code: t.test.code, display_name: nameOf(t.test) }, requirement_id: requirementOfTest(readout, t.test.testId), status: t.status, accepts_evidence: acceptsEvidence(t.test), latest_result: last ? { result: last.result, note: last.note ?? null, registered_by: last.by ? { id: last.by.id, name: last.by.name, last_name: last.by.lastName } : null, registered_at: iso(last.at) } : null, allowed_actions: actions.manualTests.get(t.test.testId) ?? [] };
      }),
  };
}
