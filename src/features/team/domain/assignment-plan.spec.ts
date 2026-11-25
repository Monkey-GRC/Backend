import { DomainError } from '../../../common/errors/domain-error';
import { ControlFact, PersonFact, planExecutorAssignment, planOwnerAssignment } from './assignment-plan';

const code = (fn: () => unknown): string | undefined => {
  try {
    fn();
  } catch (e) {
    return e instanceof DomainError ? e.code : 'other';
  }
  return undefined;
};
const control = (id: string, assignment: ControlFact['assignment'] = null, isActive = true): ControlFact => ({ id, isActive, assignment });
const person = (over: Partial<PersonFact> = {}): PersonFact => ({ id: 'r1', role: 'responsable', status: 'active', groupKind: 'responsables', leaderId: 'admin', ...over });

describe('planOwnerAssignment', () => {
  const base = { actorId: 'admin', ownerId: 'r1', owner: person(), requested: ['c1', 'c2'] };

  it('un control sin dueño y otro con dueño distinto cambian; el que ya tiene ese dueño no', () => {
    const controls = [control('c1'), control('c2', { ownerId: 'r2', executorId: 'd1' }), control('c3', { ownerId: 'r1', executorId: 'd9' })];
    const plan = planOwnerAssignment({ ...base, requested: ['c1', 'c2', 'c3'], controls });
    expect(plan).toEqual([
      { controlId: 'c1', before: { ownerId: null, executorId: null }, after: { ownerId: 'r1', executorId: null } },
      { controlId: 'c2', before: { ownerId: 'r2', executorId: 'd1' }, after: { ownerId: 'r1', executorId: null } },
    ]);
  });

  it('null deja «Sin asignar»: solo cambia lo que tenía dueño', () => {
    const plan = planOwnerAssignment({ ...base, ownerId: null, owner: null, controls: [control('c1'), control('c2', { ownerId: 'r1', executorId: 'd1' })] });
    expect(plan).toEqual([{ controlId: 'c2', before: { ownerId: 'r1', executorId: 'd1' }, after: { ownerId: null, executorId: null } }]);
  });

  it('el propio admin_empresa es un dueño válido; otro admin, no', () => {
    const yo = person({ id: 'admin', role: 'admin_empresa', groupKind: null, leaderId: null });
    expect(code(() => planOwnerAssignment({ ...base, ownerId: 'admin', owner: yo, controls: [control('c1'), control('c2')] }))).toBeUndefined();
    expect(code(() => planOwnerAssignment({ ...base, ownerId: 'a2', owner: { ...yo, id: 'a2' }, controls: [control('c1'), control('c2')] }))).toBe('OWNER_NOT_ELIGIBLE');
  });

  it('un responsable pendiente vale; uno inactivo, un delegado o un auditor, no', () => {
    const controls = [control('c1'), control('c2')];
    expect(code(() => planOwnerAssignment({ ...base, owner: person({ status: 'pending' }), controls }))).toBeUndefined();
    for (const owner of [person({ status: 'inactive' }), person({ role: 'delegado' }), person({ role: 'auditor' })]) expect(code(() => planOwnerAssignment({ ...base, owner, controls }))).toBe('OWNER_NOT_ELIGIBLE');
  });

  it('el orden de errores: dueño inexistente, control inexistente, control dado de baja y dueño no elegible', () => {
    const ok = [control('c1'), control('c2')];
    expect(code(() => planOwnerAssignment({ ...base, owner: null, controls: ok }))).toBe('NOT_FOUND');
    expect(code(() => planOwnerAssignment({ ...base, controls: [control('c1')] }))).toBe('NOT_FOUND');
    expect(code(() => planOwnerAssignment({ ...base, owner: person({ role: 'delegado' }), controls: [control('c1'), control('c2', null, false)] }))).toBe('CONTROL_RETIRED');
    expect(code(() => planOwnerAssignment({ ...base, ownerId: null, owner: null, controls: [control('c1'), control('c2', null, false)] }))).toBe('CONTROL_RETIRED');
  });
});

describe('planExecutorAssignment', () => {
  const delegate = person({ id: 'd1', role: 'delegado', groupKind: 'team', leaderId: 'r1' });
  const mine = (id: string, executorId: string | null = null) => control(id, { ownerId: 'r1', executorId });
  const base = { actorId: 'r1', onlyOwn: true, executorId: 'd1', executor: delegate, requested: ['c1', 'c2'] };

  it('pone el ejecutor y conserva al dueño; el que ya lo tiene no cambia; null lo quita', () => {
    expect(planExecutorAssignment({ ...base, controls: [mine('c1'), mine('c2', 'd1')] })).toEqual([{ controlId: 'c1', before: { ownerId: 'r1', executorId: null }, after: { ownerId: 'r1', executorId: 'd1' } }]);
    expect(planExecutorAssignment({ ...base, executorId: null, executor: null, controls: [mine('c1'), mine('c2', 'd1')] })).toEqual([{ controlId: 'c2', before: { ownerId: 'r1', executorId: 'd1' }, after: { ownerId: 'r1', executorId: null } }]);
  });

  it('un control ajeno o sin dueño es FORBIDDEN', () => {
    expect(code(() => planExecutorAssignment({ ...base, controls: [mine('c1'), control('c2', { ownerId: 'r2', executorId: null })] }))).toBe('FORBIDDEN');
    expect(code(() => planExecutorAssignment({ ...base, controls: [mine('c1'), control('c2')] }))).toBe('FORBIDDEN');
  });

  it('el administrador (D150) delega en cualquier control con dueño: el ejecutor es un delegado del equipo de ESE dueño; un control sin dueño solo admite null', () => {
    const admin = { ...base, actorId: 'admin', onlyOwn: false };
    const ajeno = control('c2', { ownerId: 'r1', executorId: null });
    expect(planExecutorAssignment({ ...admin, controls: [mine('c1'), ajeno] })).toHaveLength(2);
    expect(code(() => planExecutorAssignment({ ...admin, controls: [mine('c1'), control('c2', { ownerId: 'r2', executorId: null })] }))).toBe('EXECUTOR_NOT_IN_TEAM');
    expect(code(() => planExecutorAssignment({ ...admin, controls: [mine('c1'), control('c2')] }))).toBe('EXECUTOR_NOT_IN_TEAM');
    expect(planExecutorAssignment({ ...admin, executorId: null, executor: null, controls: [mine('c1', 'd1'), control('c2')] })).toEqual([{ controlId: 'c1', before: { ownerId: 'r1', executorId: 'd1' }, after: { ownerId: 'r1', executorId: null } }]);
  });

  it('el ejecutor debe ser un delegado vigente del equipo del actor', () => {
    const controls = [mine('c1'), mine('c2')];
    expect(code(() => planExecutorAssignment({ ...base, executor: { ...delegate, status: 'pending' }, controls }))).toBeUndefined();
    for (const executor of [{ ...delegate, status: 'inactive' }, { ...delegate, leaderId: 'r2' }, { ...delegate, groupKind: 'responsables' }, { ...delegate, groupKind: null, leaderId: null }, person({ id: 'r3' })]) {
      expect(code(() => planExecutorAssignment({ ...base, executor, controls }))).toBe('EXECUTOR_NOT_IN_TEAM');
    }
  });

  it('el orden de errores: inexistentes, FORBIDDEN, CONTROL_RETIRED y EXECUTOR_NOT_IN_TEAM', () => {
    expect(code(() => planExecutorAssignment({ ...base, executor: null, controls: [mine('c1'), mine('c2')] }))).toBe('NOT_FOUND');
    expect(code(() => planExecutorAssignment({ ...base, controls: [mine('c1')] }))).toBe('NOT_FOUND');
    expect(code(() => planExecutorAssignment({ ...base, controls: [control('c1', { ownerId: 'r2', executorId: null }, false), mine('c2')] }))).toBe('FORBIDDEN');
    expect(code(() => planExecutorAssignment({ ...base, executor: person({ id: 'r3' }), controls: [control('c1', { ownerId: 'r1', executorId: null }, false), mine('c2')] }))).toBe('CONTROL_RETIRED');
  });
});
