import { exceptionEndsOn } from '../../../../common/evaluation-parameters/exception-window';
import { expiredWhere, utcToday } from './exclusion-window';

const DAY = 86_400_000;
const d = (s: string) => new Date(`${s}T00:00:00.000Z`);
const TODAY = d('2026-11-27');
const at = (offset: number) => new Date(TODAY.getTime() + offset * DAY);

// `expiredWhere` evaluado en memoria (sus dos cláusulas) contra la regla que aplica el motor al leer.
const expiredInMemory = (validFrom: Date, validUntil: Date, maxDays: number): boolean => {
  const [byEnd, byCap] = (expiredWhere(TODAY, maxDays) as { OR: Array<{ validUntil?: { lt: Date }; validFrom?: { lt: Date } }> }).OR;
  return validUntil < byEnd.validUntil!.lt || validFrom < byCap.validFrom!.lt;
};
const expiredByEngine = (validFrom: Date, validUntil: Date, maxDays: number): boolean => exceptionEndsOn(validFrom, validUntil, { checkExceptionMaxDays: maxDays }) < TODAY;

describe('expiredWhere (D135) coincide con exceptionEndsOn', () => {
  const far = at(200);
  it.each([
    ['inicio hoy-89', -89, far, false],
    ['inicio hoy-90 (su último día es hoy)', -90, far, false],
    ['inicio hoy-91', -91, far, true],
    ['fin ayer', -10, at(-1), true],
    ['fin hoy', -10, at(0), false],
  ])('%s', (_name, from, until, expected) => {
    expect(expiredInMemory(at(from), until, 90)).toBe(expected);
    expect(expiredByEngine(at(from), until, 90)).toBe(expected);
  });
  it('con otro PR-04 (30) el borde se mueve', () => {
    for (const [from, expected] of [[-30, false], [-31, true]] as const) {
      expect(expiredInMemory(at(from), far, 30)).toBe(expected);
      expect(expiredByEngine(at(from), far, 30)).toBe(expected);
    }
  });
  it('hoy es el día UTC, no el instante', () => {
    expect(utcToday(new Date('2026-11-27T23:59:59Z'))).toEqual(TODAY);
  });
});
