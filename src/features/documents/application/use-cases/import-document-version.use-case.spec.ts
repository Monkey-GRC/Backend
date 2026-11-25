import { parseApprovalDate } from './import-document-version.use-case';

const now = new Date('2026-11-25T15:00:00Z');

describe('parseApprovalDate', () => {
  it('acepta hoy y el pasado', () => {
    expect(parseApprovalDate('2026-11-25', now)).toEqual({ date: new Date('2026-11-25T00:00:00.000Z') });
    expect(parseApprovalDate('2020-02-29', now)).toEqual({ date: new Date('2020-02-29T00:00:00.000Z') });
  });
  it('una fecha futura es approved_at.future', () => {
    expect(parseApprovalDate('2026-11-26', now)).toEqual({ error: 'approved_at.future' });
  });
  it('lo que no es una fecha AAAA-MM-DD real es date.invalid', () => {
    for (const value of ['2026-02-30', '2026-13-01', '25/11/2026', '2026-11-25T10:00:00Z', 'ayer']) expect(parseApprovalDate(value, now)).toEqual({ error: 'date.invalid' });
  });
});
