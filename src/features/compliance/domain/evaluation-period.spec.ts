import { effectiveCutoff, isPeriodDefined, utcDay } from './evaluation-period';

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
