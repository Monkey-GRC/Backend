import { PARAMS } from '../../controls/readout.fixtures';
import { evaluateManualTest } from './manual-test';
import { alertDate, currentWindow, isEvidenceCurrent, isResultCurrent, rollingWindowsWithin, windowEndDate } from './windows';

// PR-07 `rolling` (contracts/catalogo-maestro.md «PR-07: ventanas de calendario o móviles»): cada evidencia vale una periodicidad desde su fecha.
const at = (iso: string) => new Date(iso);
const day = (iso: string) => at(`${iso}T00:00:00Z`).getTime();
const ROLLING = { ...PARAMS, validityWindows: 'rolling' as const };

describe('PR-07 rolling · evidencia vigente y vencida', () => {
  it('una evidencia mensual del 20 de marzo vale hasta el 19 de abril y vence el 20', () => {
    expect(isEvidenceCurrent('monthly', at('2026-03-20T00:00:00Z'), at('2026-04-19T23:59:59Z'), 'rolling')).toBe(true);
    expect(isEvidenceCurrent('monthly', at('2026-03-20T00:00:00Z'), at('2026-04-20T00:00:00Z'), 'rolling')).toBe(false);
  });
  it('en calendario la misma evidencia ya no vale el 1 de abril (el comportamiento de calendario no cambia)', () => {
    expect(isEvidenceCurrent('monthly', at('2026-03-20T00:00:00Z'), at('2026-04-01T00:00:00Z'))).toBe(false);
    expect(isEvidenceCurrent('monthly', at('2026-03-20T00:00:00Z'), at('2026-03-31T00:00:00Z'), 'calendar')).toBe(true);
  });
  it('permanent y «cuando sea requerido» no cambian', () => {
    expect(isEvidenceCurrent('permanent', at('2020-01-01T00:00:00Z'), at('2026-04-01T00:00:00Z'), 'rolling')).toBe(true);
    expect(isEvidenceCurrent('on_demand', at('2020-01-01T00:00:00Z'), at('2026-04-01T00:00:00Z'), 'rolling')).toBe(true);
  });
  it('un resultado automático trimestral del 10 de enero sirve hasta el 9 de abril', () => {
    expect(isResultCurrent('quarterly', at('2026-01-10T00:00:00Z'), at('2026-04-09T00:00:00Z'), ROLLING)).toBe(true);
    expect(isResultCurrent('quarterly', at('2026-01-10T00:00:00Z'), at('2026-04-10T00:00:00Z'), ROLLING)).toBe(false);
  });
});

describe('PR-07 rolling · ventana y aviso previo', () => {
  it('con evidencia: de su fecha a una periodicidad después; el aviso sale los días de PR-06 antes', () => {
    const w = currentWindow({ periodicity: 'monthly', now: at('2026-04-02T00:00:00Z'), lastValidAt: at('2026-03-20T00:00:00Z'), mode: 'rolling' });
    expect(w).toEqual({ start: at('2026-03-20T00:00:00Z'), end: at('2026-04-20T00:00:00Z') });
    expect(windowEndDate(w)).toBe('2026-04-19');
    expect(alertDate(windowEndDate(w), 'monthly', ROLLING, at('2026-04-02T00:00:00Z'))).toBe('2026-04-14');
  });
  it('sin evidencia previa: la primera vence una periodicidad después del inicio del período auditado', () => {
    const w = currentWindow({ periodicity: 'quarterly', now: at('2026-02-01T00:00:00Z'), mode: 'rolling', periodStart: at('2026-01-15T00:00:00Z') });
    expect(w?.end).toEqual(at('2026-04-15T00:00:00Z'));
  });
  it('sin evidencia ni período no hay ventana; la permanente tampoco la tiene', () => {
    expect(currentWindow({ periodicity: 'monthly', now: at('2026-02-01T00:00:00Z'), mode: 'rolling' })).toBeNull();
    expect(currentWindow({ periodicity: 'permanent', now: at('2026-02-01T00:00:00Z'), mode: 'rolling', periodStart: at('2026-01-01T00:00:00Z') })).toBeNull();
  });
  it('en calendario, el mismo caso sigue siendo el mes calendario', () => {
    expect(currentWindow({ periodicity: 'monthly', now: at('2026-04-02T00:00:00Z'), lastValidAt: at('2026-03-20T00:00:00Z') })).toEqual({ start: at('2026-04-01T00:00:00Z'), end: at('2026-05-01T00:00:00Z') });
  });
});

describe('PR-07 rolling · estado de una prueba manual', () => {
  const run = (submittedAt: string, now: string, windowMode: 'rolling' | 'calendar') =>
    evaluateManualTest({ evidence: [{ state: 'compliant', submittedAt: at(submittedAt) }], periodicity: 'monthly', now: at(now), windowMode, periodStart: at('2026-01-01T00:00:00Z') });
  it('vigente: del 20 de marzo al 5 de abril sigue Correcto en rolling y trae el vencimiento', () => {
    const r = run('2026-03-20T00:00:00Z', '2026-04-05T00:00:00Z', 'rolling');
    expect(r.status).toBe('correct');
    expect(r.windowEnd).toBe('2026-04-19');
  });
  it('vencido: el 20 de abril sin evidencia nueva pasa a Vencido', () => {
    expect(run('2026-03-20T00:00:00Z', '2026-04-20T00:00:00Z', 'rolling').status).toBe('expired');
  });
  it('en calendario, la evidencia de marzo ya está vencida el 5 de abril', () => {
    expect(run('2026-03-20T00:00:00Z', '2026-04-05T00:00:00Z', 'calendar').status).toBe('expired');
  });
  it('primera ventana sin evidencia: Pendiente y vence una periodicidad después del inicio del período', () => {
    const r = evaluateManualTest({ evidence: [], periodicity: 'monthly', now: at('2026-01-10T00:00:00Z'), windowMode: 'rolling', periodStart: at('2026-01-01T00:00:00Z') });
    expect(r.status).toBe('pending');
    expect(r.windowEnd).toBe('2026-01-31');
  });
});

describe('PR-07 rolling · vencimientos dentro del período auditado (G-11)', () => {
  const period = { start: at('2026-01-01T00:00:00Z'), end: at('2026-06-30T00:00:00Z') };
  const iso = (w: { start: Date; end: Date }) => [w.start.toISOString().slice(0, 10), w.end.toISOString().slice(0, 10)];

  it('cada evidencia renueva desde su fecha y un vencimiento sin evidencia es una ventana perdida', () => {
    const r = rollingWindowsWithin('monthly', period, [day('2026-01-20'), day('2026-02-10')], at('2026-04-01T00:00:00Z'));
    expect(r.closed.map(iso)).toEqual([['2026-01-01', '2026-02-01'], ['2026-01-20', '2026-02-20'], ['2026-02-10', '2026-03-10']]);
    expect(r.missing.map(iso)).toEqual([['2026-02-10', '2026-03-10']]);
  });
  it('la evidencia posterior al vencimiento no lo recupera: el siguiente cuenta desde su fecha', () => {
    const r = rollingWindowsWithin('monthly', period, [day('2026-02-15')], at('2026-04-01T00:00:00Z'));
    expect(r.missing.map(iso)).toEqual([['2026-01-01', '2026-02-01'], ['2026-02-15', '2026-03-15']]);
    expect(r.closed).toHaveLength(3);
  });
  it('un vencimiento posterior al fin del período o a hoy no cuenta', () => {
    expect(rollingWindowsWithin('monthly', period, [], at('2026-01-31T00:00:00Z')).closed).toHaveLength(0);
    const ended = rollingWindowsWithin('quarterly', { start: at('2026-01-01T00:00:00Z'), end: at('2026-03-15T00:00:00Z') }, [], at('2026-12-31T00:00:00Z'));
    expect(ended.closed).toHaveLength(0);
  });
  it('la evidencia fuera del período no cuenta', () => {
    const r = rollingWindowsWithin('monthly', period, [day('2025-12-20')], at('2026-02-15T00:00:00Z'));
    expect(r.missing).toHaveLength(1);
  });
  it('permanent y «cuando sea requerido» no tienen vencimientos', () => {
    expect(rollingWindowsWithin('permanent', period, [], at('2026-06-01T00:00:00Z')).closed).toEqual([]);
    expect(rollingWindowsWithin('on_demand', period, [], at('2026-06-01T00:00:00Z')).closed).toEqual([]);
  });
});
