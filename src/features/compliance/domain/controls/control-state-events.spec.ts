import { ControlStateSnapshot, diffControlStates, droppedFromComplying, reachedPendingApproval } from './control-state-events';

const snap = (state: ControlStateSnapshot['state'], readiness: ControlStateSnapshot['readiness'], done = 0, total = 4): ControlStateSnapshot => ({
  code: 'IAC-12', state, readiness, progress: { done, total }, level: 'weak', levelValue: 2, managementState: 'in_progress',
});

describe('diffControlStates · el historial de cambios de estado de un control (D91)', () => {
  it('un control cuyo estado cambia deja un cambio con el estado anterior y el nuevo', () => {
    const changes = diffControlStates(new Map([['c1', snap('incomplete', 'not_measured')]]), new Map([['c1', snap('ineffective', 'needs_work', 1)]]));
    expect(changes).toEqual([{ controlId: 'c1', code: 'IAC-12', before: snap('incomplete', 'not_measured'), after: snap('ineffective', 'needs_work', 1) }]);
  });

  it('si solo cambia el semáforo, también es un cambio', () => {
    expect(diffControlStates(new Map([['c1', snap('ineffective', 'needs_work', 1)]]), new Map([['c1', snap('ineffective', 'almost_ready', 3)]]))).toHaveLength(1);
  });

  it('si solo cambia el nivel (v2), también es un cambio', () => {
    const was = snap('evaluating', 'almost_ready', 3);
    expect(diffControlStates(new Map([['c1', was]]), new Map([['c1', { ...was, level: 'partial', levelValue: 3 }]]))).toHaveLength(1);
  });

  it('si solo cambia el estado de gestión (aprobar, devolver, cargar), también es un cambio', () => {
    const was = snap('evaluating', 'almost_ready', 3);
    expect(diffControlStates(new Map([['c1', was]]), new Map([['c1', { ...was, managementState: 'returned' }]]))).toHaveLength(1);
  });

  it('un control que cumplía y deja de cumplir pierde sus aprobaciones; uno que llega a «por aprobar» avisa', () => {
    const up = { ...snap('effective', 'ready', 4), level: 'adequate', levelValue: 4 } as ControlStateSnapshot;
    const change = (before: ControlStateSnapshot, after: ControlStateSnapshot) => ({ controlId: 'c1', code: 'IAC-12', before, after });
    expect(droppedFromComplying(change({ ...up, managementState: 'approved' }, snap('ineffective', 'needs_work', 1)))).toBe(true);
    expect(droppedFromComplying(change(snap('ineffective', 'needs_work', 1), up))).toBe(false);
    expect(droppedFromComplying(change(up, { ...up, level: 'solid', levelValue: 5 }))).toBe(false);
    expect(reachedPendingApproval(change(snap('evaluating', 'almost_ready'), { ...up, managementState: 'pending_approval' }))).toBe(true);
    expect(reachedPendingApproval(change({ ...up, managementState: 'pending_approval' }, { ...up, managementState: 'pending_approval', readiness: 'almost_ready' }))).toBe(false);
  });

  it('si solo cambia el avance y no el estado ni el semáforo, no lo es', () => {
    expect(diffControlStates(new Map([['c1', snap('incomplete', 'almost_ready', 2)]]), new Map([['c1', snap('incomplete', 'almost_ready', 3)]]))).toEqual([]);
  });

  it('un control que no existía antes (o ya no existe) no es un cambio de estado', () => {
    expect(diffControlStates(new Map(), new Map([['c1', snap('effective', 'ready', 4)]]))).toEqual([]);
    expect(diffControlStates(new Map([['c1', snap('effective', 'ready', 4)]]), new Map())).toEqual([]);
  });

  it('solo salen los controles que cambiaron', () => {
    const before = new Map([['c1', snap('incomplete', 'not_measured')], ['c2', snap('effective', 'ready', 4)]]);
    const after = new Map([['c1', snap('effective', 'ready', 4)], ['c2', snap('effective', 'ready', 4)]]);
    expect(diffControlStates(before, after).map((c) => c.controlId)).toEqual(['c1']);
  });
});
