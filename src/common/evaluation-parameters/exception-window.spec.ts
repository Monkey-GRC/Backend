import { exceptionEndsOn } from './exception-window';
import { BOOK_PARAMETERS } from './parameters.fixtures';

describe('exceptionEndsOn (D135, PR-04)', () => {
  const from = new Date('2026-01-01');
  it('dura como máximo PR-04 días desde su inicio', () => {
    expect(exceptionEndsOn(from, new Date('2026-12-31'), BOOK_PARAMETERS).toISOString().slice(0, 10)).toBe('2026-04-01');
  });
  it('si la fecha pedida es anterior al tope, manda la fecha pedida', () => {
    expect(exceptionEndsOn(from, new Date('2026-02-01'), BOOK_PARAMETERS).toISOString().slice(0, 10)).toBe('2026-02-01');
  });
  it('sigue el valor de PR-04', () => {
    expect(exceptionEndsOn(from, new Date('2026-12-31'), { checkExceptionMaxDays: 10 }).toISOString().slice(0, 10)).toBe('2026-01-11');
  });
});
