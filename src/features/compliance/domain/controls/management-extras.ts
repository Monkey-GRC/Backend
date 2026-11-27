import { ControlLevel, LEVEL_VALUE } from '../engine/v2/types';
import type { PersonRef } from './management-state';

// MD-529 (D135, D140 puntos 3 y 4, D131 punto 3; contracts/cumplimiento/aprobacion.md) · Lo que las personas agregan al nivel que calcula el motor: la corrección del nivel (R5), el plan de remediación
// de cada excepción, el «No aplica» de un requisito, las ocurrencias de un requisito «cuando sea requerido» y su declaración trimestral. Lógica pura, sin Prisma ni Nest.

export type ChangeStatus = 'pending' | 'approved' | 'rejected';

export const LEVELS: readonly ControlLevel[] = ['not_evaluated', 'ineffective', 'weak', 'partial', 'adequate', 'solid'];
export const levelOfValue = (value: number): ControlLevel => LEVELS[value] ?? 'not_evaluated';

type Decided = { status: ChangeStatus; decidedBy: PersonRef | null; decidedAt: Date | null; decisionReason: string | null };

export type LevelOverrideRecord = Decided & {
  id: string;
  suggestedValue: number;
  proposedValue: number;
  justification: string;
  proposedBy: PersonRef;
  proposedAt: Date;
  windowStart: Date | null;
  invalidatedAt: Date | null;
};

export type RemediationPlanRecord = Decided & {
  id: string;
  testId: string;
  requirementId: string | null;
  what: string;
  assignee: PersonRef;
  dueDate: Date;
  proposedBy: PersonRef;
  proposedAt: Date;
  windowStart: Date | null;
  invalidatedAt: Date | null;
};

export type OccurrenceRecord = { id: string; occurredOn: Date; description: string; registeredBy: PersonRef; registeredAt: Date; hasEvidence: boolean; evidenceCount: number };
export type DeclarationRecord = { id: string; windowStart: Date; windowEnd: Date; note: string | null; declaredBy: PersonRef; declaredAt: Date };

/** La solicitud de «No aplica» de un requisito (`requirement_applicability_requests`): `status = approved` y sin `revertedAt` = el requisito está en «No aplica». */
export type ApplicabilityRecord = Decided & { id: string; requirementId: string; reason: string; requestedBy: PersonRef; requestedAt: Date; revertedBy: PersonRef | null; revertedAt: Date | null; revertReason: string | null };

/** Todo lo de MD-529 que el motor y el detalle leen de un control. Los mapas van por `client_control_requirements.id`. */
export type ManagementExtras = {
  applicability: ReadonlyMap<string, readonly ApplicabilityRecord[]>;
  overrides: readonly LevelOverrideRecord[];
  plans: readonly RemediationPlanRecord[];
  occurrences: ReadonlyMap<string, readonly OccurrenceRecord[]>;
  declarations: ReadonlyMap<string, readonly DeclarationRecord[]>;
};
export const NO_EXTRAS: ManagementExtras = { applicability: new Map(), overrides: [], plans: [], occurrences: new Map(), declarations: new Map() };

export const sameWindowStart = (a: Date | null, b: Date | null): boolean => (a === null || b === null ? a === b : a.getTime() === b.getTime());

/**
 * R5 · Los niveles que se pueden proponer (valores de la escala), dado el sugerido `s` y el que rige hoy `current`: nunca 0; con un sugerido de 1–3 («no cumple») solo 1–3 (cruzar a «cumple» sin el 100 %
 * del motor lo impide R4); con 4–5, cualquiera de 1–5. Volver al sugerido es válido (quita la corrección). El que rige hoy no se propone.
 */
export function proposableLevels(suggested: number, current: number): number[] {
  if (suggested === 0) return [];
  const pool = suggested <= 3 ? [1, 2, 3] : [1, 2, 3, 4, 5];
  return pool.filter((v) => v !== current);
}

/** La corrección vale si está aprobada, nadie la invalidó, es de la ventana vigente y el nivel sugerido sigue siendo el de entonces. */
export const isLiveOverride = (o: LevelOverrideRecord, suggested: number, windowStart: Date | null): boolean =>
  o.status === 'approved' && o.invalidatedAt === null && o.suggestedValue === suggested && sameWindowStart(o.windowStart, windowStart);

export function liveOverrideOf(overrides: readonly LevelOverrideRecord[], suggested: number, windowStart: Date | null): LevelOverrideRecord | null {
  return overrides.filter((o) => isLiveOverride(o, suggested, windowStart)).reduce<LevelOverrideRecord | null>((best, o) => (!best || (o.decidedAt?.getTime() ?? 0) > (best.decidedAt?.getTime() ?? 0) ? o : best), null);
}

/** Una solicitud sigue valiendo (puede decidirse) si nadie la invalidó, es de la ventana vigente y el sugerido no cambió. */
export const isValidRequest = (o: LevelOverrideRecord, suggested: number, windowStart: Date | null): boolean => o.invalidatedAt === null && o.suggestedValue === suggested && sameWindowStart(o.windowStart, windowStart);

export function pendingOverrideOf(overrides: readonly LevelOverrideRecord[], suggested: number, windowStart: Date | null): LevelOverrideRecord | null {
  return overrides.find((o) => o.status === 'pending' && isValidRequest(o, suggested, windowStart)) ?? null;
}

/** La propuesta que muestra el detalle: la pendiente, o la aprobada vigente, o la última rechazada de la ventana. */
export function shownOverrideOf(overrides: readonly LevelOverrideRecord[], suggested: number, windowStart: Date | null): LevelOverrideRecord | null {
  const inWindow = overrides.filter((o) => o.invalidatedAt === null && sameWindowStart(o.windowStart, windowStart));
  const latest = (rows: LevelOverrideRecord[]) => rows.reduce<LevelOverrideRecord | null>((best, o) => (!best || o.proposedAt > best.proposedAt ? o : best), null);
  return pendingOverrideOf(overrides, suggested, windowStart) ?? liveOverrideOf(overrides, suggested, windowStart) ?? latest(inWindow.filter((o) => o.status === 'rejected'));
}

/** D140 punto 4 · Un plan cuenta (para Parcial) si está aprobado, nadie lo invalidó y es de la ventana vigente. Que la prueba siga en excepción lo comprueba quien pregunta. */
export const isLivePlan = (p: RemediationPlanRecord, windowStart: Date | null): boolean => p.status === 'approved' && p.invalidatedAt === null && sameWindowStart(p.windowStart, windowStart);

/** El plan de una prueba: el vigente (pendiente o aprobado) y, si no hay, el último rechazado de la ventana. */
export function planOfTest(plans: readonly RemediationPlanRecord[], testId: string, windowStart: Date | null): RemediationPlanRecord | null {
  const mine = plans.filter((p) => p.testId === testId && p.invalidatedAt === null && sameWindowStart(p.windowStart, windowStart));
  const live = mine.find((p) => p.status === 'pending' || p.status === 'approved');
  return live ?? mine.filter((p) => p.status === 'rejected').sort((a, b) => b.proposedAt.getTime() - a.proposedAt.getTime())[0] ?? null;
}

/** Nivel del nivel final: el corregido si hay corrección vigente, si no el sugerido. */
export const finalLevelOf = (suggested: number, override: LevelOverrideRecord | null): ControlLevel => levelOfValue(override ? override.proposedValue : suggested);
/**
 * MD-529 (opción C) · En la vista del período, la corrección vigente de la ventana solo puede BAJAR el nivel: el del período es el peor entre el calculado y el corregido; si la corrección sube, se ignora.
 * «No evaluado» (0) no se toca: no hay nivel que empeorar.
 */
export const periodLevelOf = (periodValue: number, override: LevelOverrideRecord | null): ControlLevel =>
  levelOfValue(override && periodValue > 0 ? Math.min(periodValue, override.proposedValue) : periodValue);
export const levelValue = (level: ControlLevel): number => LEVEL_VALUE[level];
export const compliesAt = (level: ControlLevel): boolean => level === 'adequate' || level === 'solid';

/** ¿Se puede proponer `proposed` sobre un nivel sugerido `suggested`? `null` si sí; si no, el código del error. */
export function checkProposal(suggested: number, current: number, proposed: number): 'LEVEL_NOT_EVALUATED' | 'LEVEL_CHANGE_NOT_ALLOWED' | 'proposed_level.invalid' | null {
  if (suggested === 0) return 'LEVEL_NOT_EVALUATED';
  if (proposed === 0 || proposed === current) return 'proposed_level.invalid';
  return proposableLevels(suggested, current).includes(proposed) ? null : 'LEVEL_CHANGE_NOT_ALLOWED';
}

// --- «Cuando sea requerido»: el trimestre (D131 punto 3) --------------------------------------------------------------------------------------------

export type QuarterCoverage = 'covered' | 'declared' | 'pending' | 'exception' | 'expired';

/**
 * El estado de un trimestre de un requisito `on_demand` (aprobacion.md): abierto, sin nada o con una ocurrencia sin evidencia es Pendiente; cerrado, con una ocurrencia sin evidencia es Excepción
 * y sin ocurrencias ni declaración, Vencido. Con todas las ocurrencias con evidencia queda cubierto, y con una declaración y ninguna ocurrencia, declarado.
 */
export function quarterCoverage(occurrences: readonly OccurrenceRecord[], declared: boolean, closed: boolean): QuarterCoverage {
  if (occurrences.length > 0) return occurrences.every((o) => o.hasEvidence) ? 'covered' : closed ? 'exception' : 'pending';
  if (declared) return 'declared';
  return closed ? 'expired' : 'pending';
}

/** La solicitud de «No aplica» que muestra el detalle: la pendiente; si no, la última (aprobada vigente, rechazada o revertida). */
export function shownApplicabilityOf(rows: readonly ApplicabilityRecord[]): ApplicabilityRecord | null {
  return rows.find((r) => r.status === 'pending') ?? [...rows].sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())[0] ?? null;
}
export const isApplicabilityInForce = (r: ApplicabilityRecord): boolean => r.status === 'approved' && r.revertedAt === null;

/** Un acto de gestión lo lleva quien el permiso acota al dueño (`scoped`) o el `admin_empresa` cuando el control no tiene responsable o él lo es (`all`): G-05. */
export function leadsControl(scope: 'all' | 'scoped' | 'none', userId: string, access: { owner: { id: string } | null }): boolean {
  if (scope === 'none') return false;
  if (scope === 'scoped') return access.owner?.id === userId;
  return access.owner === null || access.owner.id === userId;
}

// --- Fechas de los actos: tolerancia de un día ------------------------------------------------------------------------------------------------------
// El modelo no guarda la zona horaria de la empresa: «hoy» es el día UTC y se da un día de margen para que quien está al oeste (o al este) de UTC no vea rechazada una fecha que para él es de hoy.
const DAY = 86_400_000;
const utcDay = (now: Date): number => Math.floor(now.getTime() / DAY) * DAY;

/** La fecha límite de un plan (`due_date`, día UTC) ya pasó si es anterior a ayer (UTC): hoy y ayer valen. */
export const isDueDatePast = (dueDate: Date, now: Date): boolean => dueDate.getTime() < utcDay(now) - DAY;

/** La fecha de una ocurrencia (`occurred_on`, día UTC) es futura si es posterior a mañana (UTC): hoy y mañana valen. */
export const isOccurrenceInFuture = (occurredOn: Date, now: Date): boolean => occurredOn.getTime() > utcDay(now) + DAY;
