import { readControl } from './control-readout';
import { asset, control, data, NOW, readoutTest, requirement, serverResults } from './readout.fixtures';

// MD-500 · Las ventanas cerradas del período auditado (R6, G-11, D140) y el aviso previo (PR-06).
const ms = (s: string) => Date.parse(`${s}T00:00:00Z`);
const d = (s: string) => new Date(`${s}T10:00:00Z`);
const PERIOD = { start: new Date('2026-07-01T00:00:00Z'), end: new Date('2026-12-31T00:00:00Z') };
const valid = (...days: string[]) => days.map((x) => ({ state: 'compliant' as const, submittedAt: d(x) }));
const evidence = (testId: string, ...days: string[]) => ({ testId, state: 'compliant' as const, submittedAt: d(days[days.length - 1]), history: valid(...days) });

describe('readControl · el período auditado (R6)', () => {
  const monthly = (days: string[], periodicity: 'monthly' | 'quarterly' = 'monthly') =>
    control([requirement('r1', [readoutTest('t1', 'documentary')], { periodicity })], { evidence: [evidence('t1', ...days)] });

  it('sin período definido no hay vista del período y nada se descarta', () => {
    const c = monthly(['2026-11-10']);
    expect(readControl(c, data([c], [])).period).toBeNull();
  });

  it('cada ventana mensual ya cerrada con evidencia válida cuenta; la que falta sale en `missing`', () => {
    const c = monthly(['2026-07-10', '2026-09-12', '2026-10-05', '2026-11-10']);
    const r = readControl(c, data([c], [], { signals: { period: PERIOD } }));
    expect(r.period).toMatchObject({ windows: { total: 4, withEvidence: 3 }, missing: [{ requirementCode: 'REQ-r1', windowStart: '2026-08-01', windowEnd: '2026-08-31' }] });
    expect(r.period?.complies).toBe(false);
    expect(r.period?.level).not.toBe('solid');
  });

  it('con evidencia en todas las ventanas cerradas el período cumple y el control es Sólido', () => {
    const c = monthly(['2026-07-10', '2026-08-10', '2026-09-12', '2026-10-05', '2026-11-10']);
    const r = readControl(c, data([c], [], { signals: { period: PERIOD } }));
    expect(r.period).toMatchObject({ complies: true, windows: { total: 4, withEvidence: 4 }, missing: [] });
    expect(r.level).toBe('solid');
  });

  it('a la fecha el control cumple pero, con una ventana cerrada sin evidencia, no llega a Sólido: queda Adecuado', () => {
    const c = monthly(['2026-07-10', '2026-09-12', '2026-10-05', '2026-11-10']);
    const r = readControl(c, data([c], [], { signals: { period: PERIOD } }));
    expect(r.level).toBe('adequate');
    expect(r.complies).toBe(true);
  });

  it('G-11: una evidencia fechada antes del período no cuenta', () => {
    const c = monthly(['2026-06-20']);
    const r = readControl(c, data([c], [], { signals: { period: { start: new Date('2026-07-01T00:00:00Z'), end: new Date('2026-12-31T00:00:00Z') } } }));
    expect(r.requirements[0].status).toBe('pending');
  });

  it('el aviso previo sale de la ventana vigente menos los días de PR-06', () => {
    const c = monthly(['2026-11-10']);
    expect(readControl(c, data([c], [])).requirements[0].tests[0]).toMatchObject({ windowEnd: '2026-11-30', alertAt: '2026-11-25' });
    const q = monthly(['2026-11-10'], 'quarterly');
    expect(readControl(q, data([q], [])).requirements[0].tests[0]).toMatchObject({ windowEnd: '2026-12-31', alertAt: '2026-12-16' });
  });

  it('una prueba técnica sin resultado de un activo en una ventana cerrada deja el requisito en Excepción en la vista del período (D140)', () => {
    const t = readoutTest('tech', 'technical');
    const c = control([requirement('r1', [t], { periodicity: 'quarterly', type: 'technical' })]);
    const servers = [asset('a1'), asset('a2')];
    const { results, dates } = serverResults(c.id, 'tech', servers, ['compliant', 'compliant']);
    const key = (a: string) => `${c.id}|tech|${a}`;
    const resultDays = new Map<string, ReadonlySet<number>>([
      [key('a1'), new Set(['2026-01-15', '2026-05-02', '2026-08-01', '2026-11-22'].map(ms))],
      [key('a2'), new Set(['2026-01-20', '2026-08-03', '2026-11-22'].map(ms))],
    ]);
    const year = { start: new Date('2026-01-01T00:00:00Z'), end: new Date('2026-12-31T00:00:00Z') };
    const r = readControl(c, data([c], servers, { results, signals: { resultDates: dates, period: year, resultDays } }));
    // A la fecha (4.º trimestre) todo pasa; en el período, el 2.º trimestre quedó sin el resultado de a2.
    expect(r.requirements[0].status).toBe('compliant');
    expect(r.period?.missing).toEqual([{ requirementCode: 'REQ-r1', windowStart: '2026-04-01', windowEnd: '2026-06-30' }]);
    expect(r.period).toMatchObject({ windows: { total: 3, withEvidence: 2 }, complies: false });
    expect(NOW.getUTCFullYear()).toBe(2026);
  });
});
