import { readControl } from './control-readout';
import { asset, control, data, PARAMS, readoutTest, requirement, serverResults } from './readout.fixtures';

// PR-07 `rolling` en la vista del período (R6, G-11, D140): vencimientos perdidos, cobertura técnica y Sólido.
const ms = (s: string) => Date.parse(`${s}T00:00:00Z`);
const d = (s: string) => new Date(`${s}T10:00:00Z`);
const rolling = (over: Partial<typeof PARAMS> = {}) => ({ ...PARAMS, validityWindows: 'rolling' as const, ...over });
const evidence = (testId: string, ...days: string[]) => ({ testId, state: 'compliant' as const, submittedAt: d(days[days.length - 1]), history: days.map((x) => ({ state: 'compliant' as const, submittedAt: d(x) })) });

describe('readControl · PR-07 rolling con prueba técnica', () => {
  const year = { start: new Date('2026-01-01T00:00:00Z'), end: new Date('2026-12-31T00:00:00Z') };
  // 2 activos en alcance; solo a1 tiene resultado en cada día (50 % de cobertura ese día).
  const run = (assetCoverage: number) => {
    const c = control([requirement('r1', [readoutTest('tech', 'technical')], { periodicity: 'quarterly', type: 'technical' })]);
    const servers = [asset('a1'), asset('a2')];
    const { results, dates } = serverResults(c.id, 'tech', servers, ['compliant', 'compliant']);
    const resultDays = new Map<string, ReadonlySet<number>>([[`${c.id}|tech|a1`, new Set(['2026-02-10', '2026-04-20', '2026-07-01', '2026-09-15', '2026-11-01'].map(ms))]]);
    return readControl(c, data([c], servers, { results, signals: { resultDates: dates, period: year, resultDays, parameters: rolling({ assetCoverage }) } }));
  };

  it('con PR-03 = 50 el resultado de un activo de dos cubre cada vencimiento', () => {
    const r = run(50);
    expect(r.period).toMatchObject({ windows: { total: 4, withEvidence: 4 }, missing: [] });
  });

  it('con PR-03 = 100 el mismo resultado no cubre: todos los vencimientos quedan perdidos', () => {
    const r = run(100);
    expect(r.period).toMatchObject({ windows: { total: 3, withEvidence: 0 }, complies: false });
    expect(r.period?.missing).toHaveLength(3);
  });
});

describe('readControl · PR-07 rolling, vencimiento perdido', () => {
  const period = { start: new Date('2026-07-01T00:00:00Z'), end: new Date('2026-12-31T00:00:00Z') };
  const monthly = (days: string[]) => control([requirement('r1', [readoutTest('t1', 'documentary')], { periodicity: 'monthly' })], { evidence: [evidence('t1', ...days)] });
  const read = (days: string[]) => { const c = monthly(days); return readControl(c, data([c], [], { signals: { period, parameters: rolling() } })); };

  it('una evidencia vieja sin renovar deja `missing` no vacío en la vista del período', () => {
    const r = read(['2026-07-10', '2026-11-20']);
    expect(r.period?.missing.map((m) => m.windowStart)).toEqual(['2026-07-10', '2026-08-10', '2026-09-10', '2026-10-10']);
    expect(r.period).toMatchObject({ complies: false });
  });

  it('ese vencimiento perdido baja el control de Sólido a Adecuado; sin perder ninguno es Sólido', () => {
    const missed = read(['2026-07-10', '2026-11-20']);
    expect(missed.requirements[0].status).toBe('compliant');
    expect(missed.level).toBe('adequate');
    const renewed = read(['2026-07-10', '2026-08-05', '2026-09-01', '2026-09-28', '2026-10-25', '2026-11-20']);
    expect(renewed.period?.missing).toEqual([]);
    expect(renewed.level).toBe('solid');
  });
});
