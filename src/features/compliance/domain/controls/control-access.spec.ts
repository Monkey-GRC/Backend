import { canSeeControl, ControlAccess, isPartyOf, NO_ACCESS } from './control-access';

const party = (id: string, role: string) => ({ id, name: null, lastName: null, role });
const access: ControlAccess = { owner: party('r1', 'responsable'), executor: party('d1', 'delegado') };

describe('canSeeControl (D102)', () => {
  it('admin_empresa y auditor ven todo, también un control sin asignar', () => {
    for (const role of ['admin_empresa', 'auditor']) expect(canSeeControl({ role, userId: 'x' }, NO_ACCESS)).toBe(true);
  });
  it('el dueño y el ejecutor ven su control', () => {
    expect(canSeeControl({ role: 'responsable', userId: 'r1' }, access)).toBe(true);
    expect(canSeeControl({ role: 'delegado', userId: 'd1' }, access)).toBe(true);
  });
  it('otro responsable o delegado no, ni uno sin asignar', () => {
    expect(canSeeControl({ role: 'responsable', userId: 'r2' }, access)).toBe(false);
    expect(canSeeControl({ role: 'delegado', userId: 'd2' }, access)).toBe(false);
    expect(canSeeControl({ role: 'responsable', userId: 'r1' }, NO_ACCESS)).toBe(false);
  });
  it('isPartyOf mira solo al dueño y al ejecutor', () => {
    expect(isPartyOf('d1', access)).toBe(true);
    expect(isPartyOf('d1', { owner: access.owner, executor: null })).toBe(false);
  });
});
