import { DomainError } from '../../../common/errors/domain-error';
import { ValidationException } from '../../../common/errors/validation.exception';
import { assertNoLiveDelegates, AssignmentRow, describeReleased, isMoving, leaderToCheck, MemberState, partitionReleased, planMemberChange, releasesControls } from './member-change-plan';

const member = (over: Partial<MemberState> = {}): MemberState => ({ id: 'u1', role: 'delegado', status: 'active', groupId: 'g1', leaderId: 'r1', ...over });
const code = (fn: () => unknown): string | undefined => {
  try {
    fn();
  } catch (e) {
    return e instanceof DomainError ? e.code : e instanceof ValidationException ? e.fields.map((f) => f.code).join(',') : 'other';
  }
  return undefined;
};
const row = (id: string, ownerId: string, executorId: string | null = null): AssignmentRow => ({ id, clientControlId: `c-${id}`, ownerId, executorId });

describe('planMemberChange', () => {
  it('admin_monkey (y cualquier rol fuera del equipo) no existe para quien llama', () => {
    expect(planMemberChange(member({ role: 'admin_monkey' }), { status: 'inactive' }, 'admin')).toBeNull();
  });

  it('uno mismo: desactivarse es LAST_ADMIN; corregir el nombre o «reactivarse» no', () => {
    const yo = member({ id: 'admin', role: 'admin_empresa', groupId: null, leaderId: null });
    expect(code(() => planMemberChange(yo, { status: 'inactive' }, 'admin'))).toBe('LAST_ADMIN');
    expect(code(() => planMemberChange(yo, { name: 'X' }, 'admin'))).toBeUndefined();
    expect(planMemberChange(yo, { status: 'active' }, 'admin')).toMatchObject({ deactivating: false, reactivating: false });
  });

  it('el orden: LAST_ADMIN antes que 422 y que USER_NOT_ACTIVATED; 422 antes que USER_NOT_ACTIVATED', () => {
    const yo = member({ id: 'admin', role: 'admin_empresa', status: 'pending' });
    expect(code(() => planMemberChange(yo, { status: 'inactive', groupId: 'g' }, 'admin'))).toBe('LAST_ADMIN');
    const pendiente = member({ role: 'auditor', status: 'pending' });
    expect(code(() => planMemberChange(pendiente, { status: 'inactive', groupId: 'g', isInternal: true }, 'admin'))).toBe('group_id.not_allowed,is_internal.not_allowed');
    expect(code(() => planMemberChange(pendiente, { status: 'inactive' }, 'admin'))).toBe('USER_NOT_ACTIVATED');
    expect(code(() => planMemberChange(pendiente, { status: 'active' }, 'admin'))).toBe('USER_NOT_ACTIVATED');
  });

  it('group_id e is_internal solo valen para un delegado, y se pueden combinar con el resto', () => {
    for (const role of ['responsable', 'auditor', 'admin_empresa']) {
      expect(code(() => planMemberChange(member({ role }), { groupId: 'g2' }, 'admin'))).toBe('group_id.not_allowed');
      expect(code(() => planMemberChange(member({ role }), { isInternal: false, name: 'N' }, 'admin'))).toBe('is_internal.not_allowed');
    }
    expect(planMemberChange(member(), { groupId: 'g2', isInternal: false, name: 'N', status: 'inactive' }, 'admin')).toMatchObject({ isDelegate: true, deactivating: true });
  });

  it('clasifica desactivar y reactivar según el estado actual; cuenta pending (suspended se trata como reactivable)', () => {
    expect(planMemberChange(member(), { status: 'inactive' }, 'a')).toMatchObject({ deactivating: true, reactivating: false });
    expect(planMemberChange(member({ status: 'inactive' }), { status: 'inactive' }, 'a')).toMatchObject({ deactivating: false, reactivating: false });
    expect(planMemberChange(member({ status: 'inactive' }), { status: 'active' }, 'a')).toMatchObject({ deactivating: false, reactivating: true });
    expect(planMemberChange(member({ status: 'suspended' }), { status: 'active' }, 'a')).toMatchObject({ reactivating: true });
    expect(planMemberChange(member(), { status: 'active' }, 'a')).toMatchObject({ reactivating: false });
  });
});

describe('leaderToCheck e isMoving', () => {
  const plan = (m: MemberState, c: Parameters<typeof planMemberChange>[1]) => planMemberChange(m, c, 'a')!;

  it('al mover importa el líder del destino (NOT_FOUND si ya no vale); mover al mismo equipo no es mover', () => {
    const m = member();
    const target = { id: 'g2', leaderId: 'r2' };
    expect(leaderToCheck(plan(m, { groupId: 'g2' }), m, target)).toEqual({ groupId: 'g2', leaderId: 'r2', onDead: 'NOT_FOUND' });
    expect(isMoving(m, target)).toBe(true);
    expect(isMoving(m, { id: 'g1', leaderId: 'r1' })).toBe(false);
    expect(isMoving(m, null)).toBe(false);
  });

  it('al reactivar a un delegado importa su líder actual (TEAM_LEADER_INACTIVE); sin equipo o sin líder, directamente', () => {
    const m = member({ status: 'inactive' });
    expect(leaderToCheck(plan(m, { status: 'active' }), m, null)).toEqual({ groupId: 'g1', leaderId: 'r1', onDead: 'TEAM_LEADER_INACTIVE' });
    for (const sin of [member({ status: 'inactive', groupId: null }), member({ status: 'inactive', leaderId: null })]) {
      expect(code(() => leaderToCheck(plan(sin, { status: 'active' }), sin, null))).toBe('TEAM_LEADER_INACTIVE');
    }
  });

  it('mover y reactivar a la vez: manda el destino; los demás cambios y roles no miran a ningún líder', () => {
    const m = member({ status: 'inactive' });
    expect(leaderToCheck(plan(m, { status: 'active', groupId: 'g2' }), m, { id: 'g2', leaderId: 'r2' })?.leaderId).toBe('r2');
    expect(leaderToCheck(plan(member(), { status: 'inactive' }), member(), null)).toBeNull();
    const aud = member({ role: 'auditor', status: 'inactive', groupId: null, leaderId: null });
    expect(leaderToCheck(plan(aud, { status: 'active' }), aud, null)).toBeNull();
  });
});

describe('baja con aviso', () => {
  it('solo desactivar o mover libera controles', () => {
    const p = (c: Parameters<typeof planMemberChange>[1]) => planMemberChange(member(), c, 'a')!;
    expect(releasesControls(p({ status: 'inactive' }), false)).toBe(true);
    expect(releasesControls(p({ name: 'N' }), false)).toBe(false);
    expect(releasesControls(p({ groupId: 'g2' }), true)).toBe(true);
    expect(releasesControls(p({ status: 'active' }), false)).toBe(false);
  });

  it('un responsable con delegados vigentes no se desactiva, aunque confirme; los demás roles y reactivar no cuentan', () => {
    const r = member({ role: 'responsable', groupId: null, leaderId: null });
    const baja = planMemberChange(r, { status: 'inactive', confirmUnassign: true }, 'a')!;
    try {
      assertNoLiveDelegates(r, baja, 2);
      fail('debía lanzar');
    } catch (e) {
      expect(e).toMatchObject({ code: 'RESPONSIBLE_HAS_DELEGATES', details: { delegates_count: 2 } });
    }
    expect(() => assertNoLiveDelegates(r, baja, 0)).not.toThrow();
    expect(() => assertNoLiveDelegates(member(), planMemberChange(member(), { status: 'inactive' }, 'a')!, 5)).not.toThrow();
  });

  it('sin confirmar, USER_HAS_ASSIGNMENTS con el conteo; con confirmación separa dueño (se borra) y ejecutor (queda sin ejecutor)', () => {
    const rows = [row('1', 'u1'), row('2', 'r1', 'u1'), row('3', 'u1')];
    try {
      partitionReleased(rows, 'u1', false);
      fail('debía lanzar');
    } catch (e) {
      expect(e).toMatchObject({ code: 'USER_HAS_ASSIGNMENTS', details: { controls_count: 3 } });
    }
    const { owned, executed } = partitionReleased(rows, 'u1', true);
    expect(owned.map((r) => r.id)).toEqual(['1', '3']);
    expect(executed.map((r) => r.id)).toEqual(['2']);
    expect(partitionReleased([], 'u1', false)).toEqual({ owned: [], executed: [] });
  });

  it('describeReleased da el antes y el después de cada control', () => {
    const [d, e] = describeReleased([row('1', 'u1')], [row('2', 'r1', 'u1')]);
    expect(d).toEqual({ controlId: 'c-1', before: { ownerId: 'u1', executorId: null }, after: { ownerId: null, executorId: null } });
    expect(e).toEqual({ controlId: 'c-2', before: { ownerId: 'r1', executorId: 'u1' }, after: { ownerId: 'r1', executorId: null } });
  });
});
