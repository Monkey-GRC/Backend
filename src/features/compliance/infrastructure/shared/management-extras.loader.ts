import { Prisma } from '../../../../../generated/prisma/client';
import { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import type { ApplicabilityRecord, DeclarationRecord, LevelOverrideRecord, ManagementExtras, OccurrenceRecord, RemediationPlanRecord } from '../../domain/controls/management-extras';
import type { PersonRef } from '../../domain/controls/management-state';
import type { ManualResult } from '../../domain/engine/v2/manual-test';
import { submissionCounts, SUBMISSION_STATE_SELECT } from '../evidence/evidence-state.mapper';

// MD-529 · Lo que las personas agregan al nivel del motor, de UN servicio, en un número fijo de consultas (no una por control): las correcciones de nivel, los planes de remediación, las ocurrencias
// de los requisitos «cuando sea requerido» con su evidencia, las declaraciones de «sin ocurrencias» y el historial de resultados manuales (DT-116).

export type ExtrasLoad = {
  extras: ReadonlyMap<string, ManagementExtras>;
  history: ReadonlyMap<string, ReadonlyMap<string, readonly ManualResult[]>>;
  /** Las personas de todo lo leído (y de `extraPersonIds`): una sola consulta por foto del servicio. */
  people: ReadonlyMap<string, PersonRef>;
};

/** Qué rango de tiempo importa de este servicio: el período auditado abierto (si hay) y el reloj. */
export type ScopeWindow = { periodStart: Date | null; now: Date };
/** El primer día (UTC) del trimestre de calendario de una fecha. */
const quarterStartOf = (d: Date): Date => new Date(Date.UTC(d.getUTCFullYear(), Math.floor(d.getUTCMonth() / 3) * 3, 1));

/** `requirements`: los requisitos del cliente de cada control (`client_control_requirements.id`) con su periodicidad vigente; solo los `on_demand` traen ocurrencias. */
export async function loadManagementExtras(
  tx: TransactionClient,
  controlIds: readonly string[],
  requirements: ReadonlyArray<{ controlId: string; requirementId: string; onDemand: boolean }>,
  /** Del período auditado abierto se lee el historial de resultados manuales (lo anterior no cuenta, G-11; sin período no hay ventanas que enumerar) y las ocurrencias y declaraciones; sin período, del trimestre vigente. */
  window: ScopeWindow,
  /** Personas que el llamador también necesita (p. ej. quién registró cada último resultado manual). */
  extraPersonIds: readonly string[] = [],
): Promise<ExtrasLoad> {
  if (controlIds.length === 0) return { extras: new Map(), history: new Map(), people: new Map() };
  const historySince = window.periodStart;
  // Ocurrencias y declaraciones: solo lo que mide `quarterCoverage` (trimestres del período y el vigente).
  const eventSince = historySince && historySince < quarterStartOf(window.now) ? historySince : quarterStartOf(window.now);
  const ids = [...controlIds];
  const onDemandIds = requirements.filter((r) => r.onDemand).map((r) => r.requirementId);
  const controlOfRequirement = new Map(requirements.map((r) => [r.requirementId, r.controlId] as const));

  const allRequirementIds = requirements.map((r) => r.requirementId);
  // Una sola consulta dice qué hay: lo más común (nada propuesto, ni ocurrencias ni solicitudes) cuesta una consulta en vez de cinco, y esta foto se lee por cada servicio en cada pasada.
  const [row] = await tx.$queryRaw<Array<{ overrides: boolean; plans: boolean; occurrences: boolean; declarations: boolean; applicability: boolean }>>(Prisma.sql`
    SELECT EXISTS (SELECT 1 FROM tenant.control_level_overrides WHERE client_control_id = ANY(${ids}::uuid[])) AS overrides,
           EXISTS (SELECT 1 FROM tenant.remediation_plans WHERE client_control_id = ANY(${ids}::uuid[])) AS plans,
           EXISTS (SELECT 1 FROM tenant.requirement_occurrences WHERE client_control_requirement_id = ANY(${onDemandIds}::uuid[])) AS occurrences,
           EXISTS (SELECT 1 FROM tenant.no_occurrence_declarations WHERE client_control_requirement_id = ANY(${onDemandIds}::uuid[]) AND invalidated_at IS NULL) AS declarations,
           EXISTS (SELECT 1 FROM tenant.requirement_applicability_requests WHERE client_control_requirement_id = ANY(${allRequirementIds}::uuid[])) AS applicability`);
  const has = row ?? { overrides: false, plans: false, occurrences: false, declarations: false, applicability: false };
  const [overrides, plans, occurrences, declarations, results, applicability] = await Promise.all([
    has.overrides ? tx.controlLevelOverride.findMany({ where: { clientControlId: { in: ids }, invalidatedAt: null }, orderBy: [{ proposedAt: 'asc' }, { id: 'asc' }] }) : [],
    has.plans ? tx.remediationPlan.findMany({ where: { clientControlId: { in: ids }, invalidatedAt: null }, orderBy: [{ proposedAt: 'asc' }, { id: 'asc' }] }) : [],
    has.occurrences ? tx.requirementOccurrence.findMany({ where: { clientControlRequirementId: { in: onDemandIds }, occurredOn: { gte: eventSince } }, orderBy: [{ occurredOn: 'asc' }, { id: 'asc' }] }) : [],
    has.declarations ? tx.noOccurrenceDeclaration.findMany({ where: { clientControlRequirementId: { in: onDemandIds }, invalidatedAt: null, windowStart: { gte: eventSince } }, orderBy: [{ windowStart: 'asc' }, { id: 'asc' }] }) : [],
    historySince ? tx.manualTestResult.findMany({ where: { clientControlId: { in: ids }, registeredAt: { gte: historySince } }, orderBy: [{ registeredAt: 'asc' }, { id: 'asc' }], select: { clientControlId: true, testId: true, result: true, registeredAt: true, note: true, registeredBy: true } }) : [],
    has.applicability ? tx.requirementApplicabilityRequest.findMany({ where: { clientControlRequirementId: { in: allRequirementIds } }, orderBy: [{ requestedAt: 'asc' }, { id: 'asc' }] }) : [],
  ]);
  const submissions = occurrences.length
    ? await tx.evidenceSubmission.findMany({ where: { requirementOccurrenceId: { in: occurrences.map((o) => o.id) } }, select: { requirementOccurrenceId: true, ...SUBMISSION_STATE_SELECT } })
    : [];

  const peopleIds = new Set<string>(extraPersonIds);
  for (const o of overrides) [o.proposedBy, o.decidedBy].forEach((x) => x && peopleIds.add(x));
  for (const p of plans) [p.proposedBy, p.decidedBy, p.assigneeId].forEach((x) => x && peopleIds.add(x));
  for (const o of occurrences) peopleIds.add(o.registeredBy);
  for (const d of declarations) peopleIds.add(d.declaredBy);
  for (const r of results) peopleIds.add(r.registeredBy);
  for (const a of applicability) [a.requestedBy, a.decidedBy, a.revertedBy].forEach((x) => x && peopleIds.add(x));
  const people = new Map(
    (peopleIds.size ? await tx.user.findMany({ where: { id: { in: [...peopleIds] } }, select: { id: true, name: true, lastName: true } }) : []).map((u) => [u.id, { id: u.id, name: u.name, lastName: u.lastName } as PersonRef] as const),
  );
  const person = (id: string): PersonRef => people.get(id) ?? { id, name: null, lastName: null };
  const maybe = (id: string | null): PersonRef | null => (id ? person(id) : null);

  const out = new Map<string, { applicability: Map<string, ApplicabilityRecord[]>; overrides: LevelOverrideRecord[]; plans: RemediationPlanRecord[]; occurrences: Map<string, OccurrenceRecord[]>; declarations: Map<string, DeclarationRecord[]> }>();
  const bucket = (controlId: string) => {
    let b = out.get(controlId);
    if (!b) out.set(controlId, (b = { applicability: new Map(), overrides: [], plans: [], occurrences: new Map(), declarations: new Map() }));
    return b;
  };
  for (const o of overrides) {
    bucket(o.clientControlId).overrides.push({
      id: o.id, suggestedValue: o.suggestedLevel, proposedValue: o.proposedLevel, justification: o.justification, status: o.status, proposedBy: person(o.proposedBy), proposedAt: o.proposedAt,
      decidedBy: maybe(o.decidedBy), decidedAt: o.decidedAt, decisionReason: o.decisionReason, windowStart: o.windowStart, invalidatedAt: o.invalidatedAt,
    });
  }
  for (const p of plans) {
    bucket(p.clientControlId).plans.push({
      id: p.id, testId: p.testId, requirementId: p.clientControlRequirementId, what: p.what, assignee: person(p.assigneeId), dueDate: p.dueDate, status: p.status, proposedBy: person(p.proposedBy), proposedAt: p.proposedAt,
      decidedBy: maybe(p.decidedBy), decidedAt: p.decidedAt, decisionReason: p.decisionReason, windowStart: p.windowStart, invalidatedAt: p.invalidatedAt,
    });
  }
  const evidenceOf = new Map<string, number>();
  for (const s of submissions) if (s.requirementOccurrenceId && submissionCounts(s)) evidenceOf.set(s.requirementOccurrenceId, (evidenceOf.get(s.requirementOccurrenceId) ?? 0) + 1);
  for (const o of occurrences) {
    const controlId = controlOfRequirement.get(o.clientControlRequirementId);
    if (!controlId) continue;
    const map = bucket(controlId).occurrences;
    const count = evidenceOf.get(o.id) ?? 0;
    map.set(o.clientControlRequirementId, [...(map.get(o.clientControlRequirementId) ?? []), { id: o.id, occurredOn: o.occurredOn, description: o.description, registeredBy: person(o.registeredBy), registeredAt: o.registeredAt, hasEvidence: count > 0, evidenceCount: count }]);
  }
  for (const d of declarations) {
    const controlId = controlOfRequirement.get(d.clientControlRequirementId);
    if (!controlId) continue;
    const map = bucket(controlId).declarations;
    map.set(d.clientControlRequirementId, [...(map.get(d.clientControlRequirementId) ?? []), { id: d.id, windowStart: d.windowStart, windowEnd: d.windowEnd, note: d.note, declaredBy: person(d.declaredBy), declaredAt: d.declaredAt }]);
  }

  for (const a of applicability) {
    const controlId = controlOfRequirement.get(a.clientControlRequirementId);
    if (!controlId) continue;
    const map = bucket(controlId).applicability;
    map.set(a.clientControlRequirementId, [...(map.get(a.clientControlRequirementId) ?? []), {
      id: a.id, requirementId: a.clientControlRequirementId, reason: a.reason, status: a.status, requestedBy: person(a.requestedBy), requestedAt: a.requestedAt, decidedBy: maybe(a.decidedBy), decidedAt: a.decidedAt,
      decisionReason: a.decisionReason, revertedBy: maybe(a.revertedBy), revertedAt: a.revertedAt, revertReason: a.revertReason,
    }]);
  }

  const history = new Map<string, Map<string, ManualResult[]>>();
  for (const r of results) {
    const byTest = history.get(r.clientControlId) ?? new Map<string, ManualResult[]>();
    byTest.set(r.testId, [...(byTest.get(r.testId) ?? []), { result: r.result, at: r.registeredAt, note: r.note, by: person(r.registeredBy) }]);
    history.set(r.clientControlId, byTest);
  }
  return { extras: out, history, people };
}
