import { ControlReadout, readControl } from './control-readout';
import { control, data, NOW, readoutTest, requirement } from './readout.fixtures';
import type { DeclarationRecord, LevelOverrideRecord, ManagementExtras, OccurrenceRecord, RemediationPlanRecord } from './management-extras';
import { NO_EXTRAS } from './management-extras';
import type { ManualResult } from '../engine/v2/manual-test';

// MD-529 · R5 (el nivel final reemplaza al sugerido), el plan de remediación (Parcial), «No aplica», los requisitos «cuando sea requerido» (DT-115) y el historial manual por ventana (DT-116).
const person = { id: 'u1', name: 'Ana', lastName: 'Pérez' };
const hourAgo = new Date(NOW.getTime() - 3_600_000);
const ok = (testId: string): [string, ManualResult] => [testId, { result: 'correct', at: hourAgo }];
const bad = (testId: string): [string, ManualResult] => [testId, { result: 'exception', at: hourAgo }];

/** Cinco requisitos operativos, cada uno con su prueba. Los de `exceptions` en Excepción; los demás, Correctos. */
function five(exceptions: string[], extras: Partial<ManagementExtras> = {}, patch = {}): ControlReadout {
  const ids = ['t1', 't2', 't3', 't4', 't5'];
  const reqs = ids.map((id) => requirement(`r${id}`, [readoutTest(id, 'operational')], { type: 'operational' }));
  const c = control(reqs, { manualResults: new Map(ids.map((id) => (exceptions.includes(id) ? bad(id) : ok(id)))), extras: { ...NO_EXTRAS, ...extras }, ...patch });
  return readControl(c, data([c], []));
}

const plan = (patch: Partial<RemediationPlanRecord> = {}): RemediationPlanRecord => ({
  id: 'p1', testId: 't1', requirementId: 'rt1', what: 'Firmar el acta.', assignee: person, dueDate: new Date('2030-01-01'), status: 'approved', proposedBy: person, proposedAt: hourAgo, decidedBy: person, decidedAt: hourAgo,
  decisionReason: null, windowStart: null, invalidatedAt: null, ...patch,
});
const override = (patch: Partial<LevelOverrideRecord> = {}): LevelOverrideRecord => ({
  id: 'o1', suggestedValue: 3, proposedValue: 1, justification: 'No refleja la realidad.', status: 'approved', proposedBy: person, proposedAt: hourAgo, decidedBy: person, decidedAt: hourAgo, decisionReason: null, windowStart: null,
  invalidatedAt: null, ...patch,
});

describe('Parcial exige un plan aprobado por cada excepción (D140 punto 4)', () => {
  it('sin plan, 80 % es Débil; con el plan aprobado y vigente, Parcial', () => {
    expect(five(['t1'])).toMatchObject({ level: 'weak', suggestedLevel: 'weak', complies: false });
    expect(five(['t1'], { plans: [plan()] })).toMatchObject({ level: 'partial', suggestedLevel: 'partial' });
  });

  it('un plan pendiente, rechazado o invalidado no cuenta', () => {
    for (const p of [plan({ status: 'pending' }), plan({ status: 'rejected' }), plan({ invalidatedAt: hourAgo })]) expect(five(['t1'], { plans: [p] }).level).toBe('weak');
  });

  it('cada excepción necesita el suyo', () => {
    expect(five(['t1', 't2'], { plans: [plan()] }).level).toBe('weak'); // 60 %: Débil de todas formas
    expect(five(['t1'], { plans: [plan({ testId: 't2' })] }).level).toBe('weak');
  });
});

describe('R5 · el nivel final reemplaza al sugerido', () => {
  it('una corrección aprobada y vigente cambia el nivel, complies y el estado; el sugerido queda aparte', () => {
    const r = five(['t1'], { plans: [plan()], overrides: [override()] });
    expect(r).toMatchObject({ level: 'ineffective', levelValue: 1, suggestedLevel: 'partial', suggestedLevelValue: 3, complies: false, state: 'ineffective' });
    expect(r.levelOverride?.id).toBe('o1');
  });

  // Sin período definido el motor da Sólido a un control limpio: el sugerido es 5.
  it('moverse dentro del lado de cumple (5 → 4) sigue cumpliendo', () => {
    const r = five([], { overrides: [override({ suggestedValue: 5, proposedValue: 4 })] });
    expect(r).toMatchObject({ suggestedLevel: 'solid', level: 'adequate', complies: true });
  });

  it('bajar de cumple a no cumple deja el control sin cumplir y fuera del rollup', () => {
    const r = five([], { overrides: [override({ suggestedValue: 5, proposedValue: 2 })] });
    expect(r).toMatchObject({ level: 'weak', complies: false });
    expect(r.rollupState).not.toBe('effective');
    expect(r.managementState).not.toBe('approved');
  });

  it('en la vista del período la corrección solo baja el nivel de su ventana: la que sube no cuenta y la de otra ventana tampoco', () => {
    const period = { start: new Date('2026-01-01T00:00:00Z'), end: new Date('2027-12-31T00:00:00Z') };
    const run = (o: LevelOverrideRecord) => {
      const ids = ['t1', 't2', 't3', 't4', 't5'];
      const reqs = ids.map((id) => requirement(`r${id}`, [readoutTest(id, 'operational')], { type: 'operational' }));
      const c = control(reqs, { manualResults: new Map(ids.map(ok)), extras: { ...NO_EXTRAS, overrides: [o] } });
      return readControl(c, data([c], [], { signals: { period } }));
    };
    expect(run(override({ suggestedValue: 5, proposedValue: 2 })).period).toMatchObject({ level: 'weak', complies: false });
    const raised = run(override({ suggestedValue: 5, proposedValue: 5 }));
    expect(raised.period?.level).toBe(raised.suggestedLevel);
    expect(run(override({ suggestedValue: 5, proposedValue: 2, windowStart: new Date('2026-01-01') })).period?.level).toBe(raised.suggestedLevel);
  });

  it.each([
    ['pendiente', override({ status: 'pending' })],
    ['rechazada', override({ status: 'rejected' })],
    ['invalidada', override({ invalidatedAt: hourAgo })],
    ['de otra ventana', override({ windowStart: new Date('2026-01-01') })],
    ['con otro nivel sugerido', override({ suggestedValue: 2 })],
  ])('una corrección %s no rige', (_caso, o) => {
    const r = five(['t1'], { plans: [plan()], overrides: [o] });
    expect(r).toMatchObject({ level: 'partial', levelOverride: null });
  });
});

describe('«No aplica» de un requisito', () => {
  it('un requisito en No aplica aprobado sale del denominador: 4 de 4 cumplen y el control cumple', () => {
    const ids = ['t1', 't2', 't3', 't4', 't5'];
    const reqs = ids.map((id, i) => requirement(`r${id}`, [readoutTest(id, 'operational')], { type: 'operational', isApplicable: i !== 0 }));
    const c = control(reqs, { manualResults: new Map([bad('t1'), ...ids.slice(1).map(ok)]) });
    expect(readControl(c, data([c], []))).toMatchObject({ cPercent: 100, complies: true, progress: { done: 4, total: 4 } });
  });
});

describe('«Cuando sea requerido» (DT-115, D131 punto 3)', () => {
  const quarter = { start: new Date('2026-10-01T00:00:00Z'), end: new Date('2026-12-31T00:00:00Z') };
  const occurrence = (patch: Partial<OccurrenceRecord> = {}): OccurrenceRecord => ({ id: 'e1', occurredOn: new Date('2026-11-10'), description: 'Alta', registeredBy: person, registeredAt: hourAgo, hasEvidence: false, evidenceCount: 0, ...patch });
  const declaration = (start = '2026-10-01'): DeclarationRecord => ({ id: 'd1', windowStart: new Date(start), windowEnd: new Date('2026-12-31'), note: null, declaredBy: person, declaredAt: hourAgo });
  const onDemand = (extras: Partial<ManagementExtras>, period = quarter, manual?: ManualResult) => {
    const c = control([requirement('r1', [readoutTest('t1', 'operational')], { type: 'operational', periodicity: 'on_demand' })], {
      extras: { ...NO_EXTRAS, ...extras }, manualResults: manual ? new Map([['t1', manual]]) : new Map(),
    });
    return readControl(c, data([c], [], { signals: { period } }));
  };
  const status = (r: ControlReadout) => r.requirements[0].tests[0].status;

  it('trimestre abierto sin nada o con una ocurrencia sin evidencia: Pendiente, con el aviso previo', () => {
    expect(status(onDemand({}))).toBe('pending');
    expect(status(onDemand({ occurrences: new Map([['r1', [occurrence()]]]) }))).toBe('pending');
    expect(onDemand({}).requirements[0].tests[0].alertAt).not.toBeNull();
  });

  it('la declaración de «sin ocurrencias» deja la prueba Correcta sin resultado que registrar', () => {
    expect(status(onDemand({ declarations: new Map([['r1', [declaration()]]]) }))).toBe('correct');
  });

  it('todas las ocurrencias con evidencia: decide el resultado del responsable registrado en el trimestre', () => {
    const covered = { occurrences: new Map([['r1', [occurrence({ hasEvidence: true, evidenceCount: 1 })]]]) };
    expect(status(onDemand(covered))).toBe('pending');
    expect(status(onDemand(covered, quarter, { result: 'correct', at: new Date('2026-11-12T10:00:00Z') }))).toBe('correct');
    expect(status(onDemand(covered, quarter, { result: 'observation', at: new Date('2026-11-12T10:00:00Z'), note: 'x' }))).toBe('observation');
  });

  it('un trimestre cerrado del período con una ocurrencia sin evidencia es Excepción; sin ocurrencias ni declaración, Vencido', () => {
    const period = { start: new Date('2026-04-01T00:00:00Z'), end: new Date('2026-12-31T00:00:00Z') };
    expect(status(onDemand({ occurrences: new Map([['r1', [occurrence({ occurredOn: new Date('2026-05-10') })]]]) }, period))).toBe('exception');
    expect(status(onDemand({}, period))).toBe('expired');
    // Con declaración en cada trimestre cerrado y en el actual, cumple.
    const declared = new Map([['r1', ['2026-04-01', '2026-07-01', '2026-10-01'].map((s) => declaration(s))]]);
    expect(status(onDemand({ declarations: declared }, period))).toBe('correct');
  });

  it('la vista del período cuenta cada trimestre cerrado: cubierto si hay declaración u ocurrencias con evidencia', () => {
    const period = { start: new Date('2026-04-01T00:00:00Z'), end: new Date('2026-12-31T00:00:00Z') };
    const r = onDemand({ declarations: new Map([['r1', [declaration('2026-04-01'), declaration('2026-10-01')]]]) }, period);
    expect(r.period).toMatchObject({ windows: { total: 2, withEvidence: 1 }, missing: [{ requirementCode: 'REQ-r1', windowStart: '2026-07-01', windowEnd: '2026-09-30' }] });
  });
});

describe('DT-116 · la vista del período lee el historial de resultados manuales', () => {
  const period = { start: new Date('2026-07-01T00:00:00Z'), end: new Date('2026-12-31T00:00:00Z') };
  const monthly = (history: ManualResult[]) => {
    const c = control([requirement('r1', [readoutTest('t1', 'operational')], { type: 'operational', periodicity: 'monthly' })], {
      manualResults: new Map([['t1', history[history.length - 1]]]), manualResultHistory: new Map([['t1', history]]),
    });
    return readControl(c, data([c], [], { signals: { period } }));
  };
  const at = (s: string): ManualResult => ({ result: 'correct', at: new Date(`${s}T10:00:00Z`) });

  it('un resultado ya reemplazado cubre su ventana: con un resultado por mes, no falta ninguna', () => {
    const r = monthly(['2026-07-10', '2026-08-10', '2026-09-10', '2026-10-10', '2026-11-10'].map(at));
    expect(r.period).toMatchObject({ windows: { total: 4, withEvidence: 4 }, missing: [] });
  });

  it('una ventana sin resultado registrado dentro de ella sigue faltando', () => {
    const r = monthly(['2026-07-10', '2026-09-10', '2026-10-10', '2026-11-10'].map(at));
    expect(r.period?.missing.map((m) => m.windowStart)).toEqual(['2026-08-01']);
  });
});
