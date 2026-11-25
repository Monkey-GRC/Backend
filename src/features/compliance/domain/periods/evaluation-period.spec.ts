import { effectiveCutoff, hasEnded, isPeriodDefined, isPeriodTooShort, minPeriodMonthsOf, nextPeriod, utcDay } from './evaluation-period';

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);
const day = (x: Date) => x.toISOString().slice(0, 10);
const TODAY = d('2026-10-20');

describe('El período y la fecha de corte de la evaluación (D87)', () => {
  it('está definido con inicio y fin, aunque no haya fecha de corte guardada', () => {
    expect(isPeriodDefined({ periodStart: d('2026-01-01'), periodEnd: d('2026-12-31'), cutoffDate: null })).toBe(true);
  });

  it('sin inicio o sin fin no está definido, y entonces no hay fecha de corte efectiva', () => {
    expect(isPeriodDefined({ periodStart: null, periodEnd: null, cutoffDate: null })).toBe(false);
    expect(isPeriodDefined({ periodStart: d('2026-01-01'), periodEnd: null, cutoffDate: null })).toBe(false);
    expect(effectiveCutoff({ periodStart: d('2026-01-01'), periodEnd: null, cutoffDate: null }, TODAY)).toBeNull();
  });

  it('sin fecha de corte guardada, la efectiva es hoy y no está congelada', () => {
    const c = effectiveCutoff({ periodStart: d('2026-01-01'), periodEnd: d('2026-12-31'), cutoffDate: null }, TODAY)!;
    expect(day(c.date)).toBe('2026-10-20');
    expect(c.frozen).toBe(false);
  });

  it('con una fecha de corte guardada, esa es la efectiva y está congelada, sin importar qué día sea hoy', () => {
    const c = effectiveCutoff({ periodStart: d('2026-01-01'), periodEnd: d('2026-12-31'), cutoffDate: d('2026-10-14') }, TODAY)!;
    expect(day(c.date)).toBe('2026-10-14');
    expect(c.frozen).toBe(true);
  });

  it('si el período ya terminó, la fecha de corte no pasa del fin; si aún no empieza, no queda antes del inicio', () => {
    expect(day(effectiveCutoff({ periodStart: d('2025-01-01'), periodEnd: d('2025-12-31'), cutoffDate: null }, TODAY)!.date)).toBe('2025-12-31');
    expect(day(effectiveCutoff({ periodStart: d('2027-01-01'), periodEnd: d('2027-06-30'), cutoffDate: null }, TODAY)!.date)).toBe('2027-01-01');
  });

  it('un período de un solo día (SOC 2 Tipo I) está definido y su corte es ese día', () => {
    const p = { periodStart: d('2026-10-15'), periodEnd: d('2026-10-15'), cutoffDate: null };
    expect(isPeriodDefined(p)).toBe(true);
    expect(day(effectiveCutoff(p, TODAY)!.date)).toBe('2026-10-15');
  });

  it('hoy es un día UTC, sin la hora', () => {
    expect(utcDay(new Date('2026-10-20T23:59:59.000Z')).toISOString()).toBe('2026-10-20T00:00:00.000Z');
  });
});

describe('El período siguiente (D145)', () => {
  const next = (start: string, end: string) => {
    const n = nextPeriod({ periodStart: d(start), periodEnd: d(end) });
    return [day(n.periodStart), day(n.periodEnd)];
  };

  it('de mes completo a mes completo: empieza el día después y dura los mismos meses de calendario', () => {
    expect(next('2026-01-01', '2026-06-30')).toEqual(['2026-07-01', '2026-12-31']);
    expect(next('2026-07-01', '2026-12-31')).toEqual(['2027-01-01', '2027-06-30']);
    expect(next('2026-01-01', '2026-12-31')).toEqual(['2027-01-01', '2027-12-31']);
    expect(next('2026-02-01', '2026-04-30')).toEqual(['2026-05-01', '2026-07-31']);
  });

  it('si el anterior no iba de inicio a fin de mes, dura el mismo número de días', () => {
    expect(next('2026-03-15', '2026-09-14')).toEqual(['2026-09-15', '2027-03-17']);
    expect(next('2026-01-01', '2026-06-29')).toEqual(['2026-06-30', '2026-12-26']);
  });

  it('PR-16: 6 meses es el mínimo; un día menos es demasiado corto', () => {
    expect(isPeriodTooShort(d('2026-01-01'), d('2026-06-30'), 6)).toBe(false);
    expect(isPeriodTooShort(d('2026-01-01'), d('2026-06-29'), 6)).toBe(true);
  });

  it('un período terminó cuando su último día ya pasó', () => {
    expect(hasEnded(d('2026-10-19'), TODAY)).toBe(true);
    expect(hasEnded(d('2026-10-20'), TODAY)).toBe(false);
  });
});

describe('la duración mínima del período por marco (PR-16, MD-499)', () => {
  it('SOC 2 usa el parámetro; un marco sin mínimo da null', () => {
    expect(minPeriodMonthsOf('soc2', 6)).toBe(6);
    expect(minPeriodMonthsOf('soc2', 9)).toBe(9);
    expect(minPeriodMonthsOf('iso27001', 6)).toBeNull();
  });
});
