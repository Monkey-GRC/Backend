import { PARAMS } from '../../controls/readout.fixtures';
import { alertDate, closedWindowsWithin, currentWindow, isEvidenceCurrent, isFresh, isResultCurrent, windowEndDate } from './windows';

const at = (iso: string) => new Date(iso);
const range = (periodicity: Parameters<typeof currentWindow>[0]['periodicity'], now: string) => {
  const w = currentWindow({ periodicity, now: at(now) });
  return w && [w.start.toISOString().slice(0, 10), w.end.toISOString().slice(0, 10)];
};

describe('currentWindow · ventanas de calendario (D131)', () => {
  it('diaria: el día de hoy', () => expect(range('daily', '2026-11-23T15:00:00Z')).toEqual(['2026-11-23', '2026-11-24']));
  it('semanal: de lunes a domingo', () => {
    expect(range('weekly', '2026-11-23T15:00:00Z')).toEqual(['2026-11-23', '2026-11-30']); // lunes
    expect(range('weekly', '2026-11-29T23:00:00Z')).toEqual(['2026-11-23', '2026-11-30']); // domingo
  });
  it('mensual: el mes calendario', () => expect(range('monthly', '2026-02-10T00:00:00Z')).toEqual(['2026-02-01', '2026-03-01']));
  it('bimestral: ene-feb, mar-abr, …', () => {
    expect(range('bimonthly', '2026-02-10T00:00:00Z')).toEqual(['2026-01-01', '2026-03-01']);
    expect(range('bimonthly', '2026-11-23T00:00:00Z')).toEqual(['2026-11-01', '2027-01-01']);
  });
  it('trimestral: ene-mar, abr-jun, …', () => {
    expect(range('quarterly', '2026-05-01T00:00:00Z')).toEqual(['2026-04-01', '2026-07-01']);
    expect(range('quarterly', '2026-12-31T23:00:00Z')).toEqual(['2026-10-01', '2027-01-01']);
  });
  it('semestral: el semestre calendario', () => {
    expect(range('semiannual', '2026-06-30T00:00:00Z')).toEqual(['2026-01-01', '2026-07-01']);
    expect(range('semiannual', '2026-07-01T00:00:00Z')).toEqual(['2026-07-01', '2027-01-01']);
  });
  it('anual: 12 meses desde la última evidencia válida (D140), no el año del período', () => {
    const w = currentWindow({ periodicity: 'annual', now: at('2026-11-23T00:00:00Z'), lastValidAt: at('2026-03-15T10:00:00Z') });
    expect(w?.start.toISOString()).toBe('2026-03-15T10:00:00.000Z');
    expect(w?.end.toISOString()).toBe('2027-03-15T10:00:00.000Z');
    expect(windowEndDate(w)).toBe('2027-03-14');
  });
  it('anual sin evidencia, permanente y por evento: no tienen ventana', () => {
    expect(currentWindow({ periodicity: 'annual', now: NOW_ })).toBeNull();
    expect(currentWindow({ periodicity: 'permanent', now: NOW_ })).toBeNull();
    expect(currentWindow({ periodicity: 'on_demand', now: NOW_ })).toBeNull();
    expect(currentWindow({ periodicity: null, now: NOW_ })).toBeNull();
  });
  it('la anual de una evidencia del 29 de febrero termina el 28 de febrero del año siguiente', () => {
    const w = currentWindow({ periodicity: 'annual', now: at('2028-06-01T00:00:00Z'), lastValidAt: at('2028-02-29T00:00:00Z') });
    expect(w?.end.toISOString().slice(0, 10)).toBe('2029-02-28');
  });
  it('window_end es el último día de la ventana (inclusive)', () => {
    expect(windowEndDate(currentWindow({ periodicity: 'quarterly', now: at('2026-11-23T00:00:00Z') }))).toBe('2026-12-31');
    expect(windowEndDate(null)).toBeNull();
  });
});
const NOW_ = new Date('2026-11-23T12:00:00Z');

describe('isEvidenceCurrent', () => {
  it('en calendario, la evidencia de la ventana anterior ya no vale', () => {
    expect(isEvidenceCurrent('quarterly', at('2026-10-02T00:00:00Z'), NOW_)).toBe(true);
    expect(isEvidenceCurrent('quarterly', at('2026-09-30T00:00:00Z'), NOW_)).toBe(false);
    expect(isEvidenceCurrent('monthly', at('2026-10-31T00:00:00Z'), NOW_)).toBe(false);
  });
  it('anual: vale 12 meses desde la entrega', () => {
    expect(isEvidenceCurrent('annual', at('2025-12-01T00:00:00Z'), NOW_)).toBe(true);
    expect(isEvidenceCurrent('annual', at('2025-11-01T00:00:00Z'), NOW_)).toBe(false);
  });
  it('permanente, por evento y sin periodicidad no se vencen por fecha', () => {
    expect(isEvidenceCurrent('permanent', at('2020-01-01T00:00:00Z'), NOW_)).toBe(true);
    expect(isEvidenceCurrent('on_demand', at('2020-01-01T00:00:00Z'), NOW_)).toBe(true);
    expect(isEvidenceCurrent(null, at('2020-01-01T00:00:00Z'), NOW_)).toBe(true);
  });
});

describe('frescura de lo automático (PR-05)', () => {
  it('un resultado vale si tiene 24 horas o menos', () => {
    expect(isFresh(at('2026-11-22T12:00:00Z'), NOW_, PARAMS)).toBe(true);
    expect(isFresh(at('2026-11-22T11:59:00Z'), NOW_, PARAMS)).toBe(false);
  });
  it('en lo permanente decide la frescura; en calendario, la ventana', () => {
    expect(isResultCurrent('permanent', at('2026-11-21T00:00:00Z'), NOW_, PARAMS)).toBe(false);
    expect(isResultCurrent('monthly', at('2026-11-02T00:00:00Z'), NOW_, PARAMS)).toBe(true);
    expect(isResultCurrent('monthly', at('2026-10-30T00:00:00Z'), NOW_, PARAMS)).toBe(false);
    expect(isResultCurrent(null, at('2020-01-01T00:00:00Z'), NOW_, PARAMS)).toBe(true);
  });
  it('un parámetro distinto cambia el resultado: la frescura no está escrita en la lógica', () => {
    expect(isFresh(at('2026-11-22T11:59:00Z'), NOW_, { ...PARAMS, freshnessHours: 48 })).toBe(true);
  });
});

describe('closedWindowsWithin · las ventanas cerradas dentro del período (G-11, R6)', () => {
  const period = { start: at('2026-07-01T00:00:00Z'), end: at('2026-12-31T00:00:00Z') };
  const days = (list: ReturnType<typeof closedWindowsWithin>) => list.map((w) => [w.start.toISOString().slice(0, 10), windowEndDate(w)]);

  it('mensual: solo los meses completos ya terminados', () => {
    expect(days(closedWindowsWithin('monthly', period, at('2026-11-23T12:00:00Z')))).toEqual([
      ['2026-07-01', '2026-07-31'], ['2026-08-01', '2026-08-31'], ['2026-09-01', '2026-09-30'], ['2026-10-01', '2026-10-31'],
    ]);
  });

  it('una ventana que solo toca el borde del período no cuenta', () => {
    const mid = { start: at('2026-07-15T00:00:00Z'), end: at('2026-12-15T00:00:00Z') };
    expect(days(closedWindowsWithin('monthly', mid, at('2027-01-10T00:00:00Z'))).map((w) => w[0])).toEqual(['2026-08-01', '2026-09-01', '2026-10-01', '2026-11-01']);
  });

  it('con el período terminado, no pasa de su fin aunque hoy sea mucho después', () => {
    expect(closedWindowsWithin('quarterly', period, at('2027-05-01T00:00:00Z'))).toHaveLength(2);
    expect(closedWindowsWithin('semiannual', period, at('2027-05-01T00:00:00Z'))).toHaveLength(1);
  });

  it('semanal y diaria se enumeran; la ventana de hoy sigue abierta', () => {
    expect(closedWindowsWithin('daily', period, at('2026-07-04T12:00:00Z'))).toHaveLength(3);
    expect(closedWindowsWithin('weekly', period, at('2026-07-20T12:00:00Z'))).toHaveLength(2);
  });

  it('anual, permanente y por evento no tienen ventanas fijas', () => {
    for (const p of ['annual', 'permanent', 'on_demand', null] as const) expect(closedWindowsWithin(p, period, at('2026-12-01T00:00:00Z'))).toEqual([]);
  });
});

describe('alertDate · el aviso previo (PR-06)', () => {
  const NOW_ = at('2026-11-23T12:00:00Z');
  it.each([
    ['daily', '2026-11-23', '2026-11-23'],
    ['weekly', '2026-11-29', '2026-11-27'],
    ['monthly', '2026-11-30', '2026-11-25'],
    ['bimonthly', '2026-12-31', '2026-12-21'],
    ['quarterly', '2026-12-31', '2026-12-16'],
    ['semiannual', '2026-12-31', '2026-12-11'],
    ['annual', '2027-03-15', '2027-02-13'],
  ] as const)('%s: cierra %s, avisa %s', (periodicity, end, alert) => {
    expect(alertDate(end, periodicity, PARAMS, NOW_)).toBe(alert);
  });

  it('sin ventana o permanente no hay aviso', () => {
    expect(alertDate(null, 'monthly', PARAMS, NOW_)).toBeNull();
    expect(alertDate(null, 'permanent', PARAMS, NOW_)).toBeNull();
  });

  it('por evento: 15 días antes del cierre del trimestre', () => {
    expect(alertDate(null, 'on_demand', PARAMS, NOW_)).toBe('2026-12-16');
  });
});
