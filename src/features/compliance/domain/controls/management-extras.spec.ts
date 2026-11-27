import { checkProposal, isDueDatePast, isOccurrenceInFuture, leadsControl, LevelOverrideRecord, periodLevelOf, proposableLevels, quarterCoverage } from './management-extras';

// MD-529 · Las reglas puras de R5 y de los requisitos «cuando sea requerido».
describe('proposableLevels · R5 (D140 punto 3)', () => {
  it('con un sugerido de «no cumple» (1 a 3) solo se mueve entre 1 y 3: nunca cruza a cumple', () => {
    expect(proposableLevels(3, 3)).toEqual([1, 2]);
    expect(proposableLevels(2, 3)).toEqual([1, 2]); // 3 es el que rige
    expect(proposableLevels(1, 1)).toEqual([2, 3]);
  });
  it('con un sugerido de cumple (4 o 5) puede bajar a 1–3 o moverse dentro del lado', () => {
    expect(proposableLevels(4, 4)).toEqual([1, 2, 3, 5]);
    expect(proposableLevels(5, 5)).toEqual([1, 2, 3, 4]);
  });
  it('no hay nada que proponer si no se evaluó, y nunca el nivel 0', () => {
    expect(proposableLevels(0, 0)).toEqual([]);
    expect(proposableLevels(4, 4)).not.toContain(0);
  });
  it('volver al sugerido es válido cuando hay una corrección', () => {
    expect(proposableLevels(3, 1)).toContain(3);
    expect(proposableLevels(4, 2)).toContain(4);
  });
});

describe('checkProposal', () => {
  it.each([
    [0, 0, 2, 'LEVEL_NOT_EVALUATED'],
    [3, 3, 4, 'LEVEL_CHANGE_NOT_ALLOWED'],
    [3, 3, 5, 'LEVEL_CHANGE_NOT_ALLOWED'],
    [3, 3, 3, 'proposed_level.invalid'],
    [3, 3, 0, 'proposed_level.invalid'],
    [3, 3, 1, null],
    [4, 4, 5, null],
    [5, 5, 2, null],
  ] as const)('sugerido %i, rige %i, propone %i → %s', (suggested, current, proposed, expected) => {
    expect(checkProposal(suggested, current, proposed)).toBe(expected);
  });
});

describe('leadsControl · quién lleva el control (G-05)', () => {
  it('el acotado es el dueño; el administrador, si no hay dueño o él lo es', () => {
    expect(leadsControl('scoped', 'r1', { owner: { id: 'r1' } })).toBe(true);
    expect(leadsControl('scoped', 'r2', { owner: { id: 'r1' } })).toBe(false);
    expect(leadsControl('scoped', 'r1', { owner: null })).toBe(false);
    expect(leadsControl('all', 'a1', { owner: null })).toBe(true);
    expect(leadsControl('all', 'a1', { owner: { id: 'a1' } })).toBe(true);
    expect(leadsControl('all', 'a1', { owner: { id: 'r1' } })).toBe(false);
    expect(leadsControl('none', 'a1', { owner: null })).toBe(false);
  });
});

describe('quarterCoverage · el trimestre de un requisito «cuando sea requerido»', () => {
  const occ = (hasEvidence: boolean) => ({ id: 'e', occurredOn: new Date(), description: '', registeredBy: { id: 'u', name: null, lastName: null }, registeredAt: new Date(), hasEvidence, evidenceCount: hasEvidence ? 1 : 0 });
  it.each([
    [[], false, false, 'pending'],
    [[], false, true, 'expired'],
    [[], true, false, 'declared'],
    [[], true, true, 'declared'],
    [[occ(false)], false, false, 'pending'],
    [[occ(false)], false, true, 'exception'],
    [[occ(true)], false, true, 'covered'],
    [[occ(true), occ(false)], false, true, 'exception'],
  ] as const)('%j declarado=%s cerrado=%s → %s', (occurrences, declared, closed, expected) => {
    expect(quarterCoverage(occurrences as never, declared, closed)).toBe(expected);
  });
});

describe('periodLevelOf · la corrección en la vista del período solo baja (MD-529, opción C)', () => {
  const person = { id: 'u1', name: 'Ana' };
  const at = new Date('2026-11-01T00:00:00Z');
  const override = (proposedValue: number): LevelOverrideRecord => ({
    id: 'o1', suggestedValue: 3, proposedValue, justification: 'x', status: 'approved', proposedBy: person, proposedAt: at, decidedBy: person, decidedAt: at, decisionReason: null, windowStart: null, invalidatedAt: null,
  } as LevelOverrideRecord);
  it('la corrección que baja aplica', () => expect(periodLevelOf(3, override(1))).toBe('ineffective'));
  it('la corrección que sube no aplica', () => expect(periodLevelOf(3, override(5))).toBe('partial'));
  it('sin corrección vigente (otra ventana, invalidada o pendiente) el período queda como lo calculó el motor', () => expect(periodLevelOf(3, null)).toBe('partial'));
  it('«No evaluado» no se toca', () => expect(periodLevelOf(0, override(1))).toBe('not_evaluated'));
});

describe('fechas de los actos: tolerancia de un día (MD-529)', () => {
  const now = new Date('2026-11-26T03:00:00Z');
  const day = (s: string) => new Date(`${s}T00:00:00.000Z`);
  it('due_date: hoy y ayer (UTC) valen; anteayer ya pasó', () => {
    expect(isDueDatePast(day('2026-11-26'), now)).toBe(false);
    expect(isDueDatePast(day('2026-11-25'), now)).toBe(false);
    expect(isDueDatePast(day('2026-11-24'), now)).toBe(true);
  });
  it('occurred_on: hoy y mañana (UTC) valen; pasado mañana es futuro', () => {
    expect(isOccurrenceInFuture(day('2026-11-26'), now)).toBe(false);
    expect(isOccurrenceInFuture(day('2026-11-27'), now)).toBe(false);
    expect(isOccurrenceInFuture(day('2026-11-28'), now)).toBe(true);
  });
  it('a las 23:59 UTC el borde no se mueve', () => {
    const late = new Date('2026-11-26T23:59:59Z');
    expect(isDueDatePast(day('2026-11-25'), late)).toBe(false);
    expect(isDueDatePast(day('2026-11-24'), late)).toBe(true);
    expect(isOccurrenceInFuture(day('2026-11-27'), late)).toBe(false);
  });
});
