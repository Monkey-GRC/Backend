import { USER_ROLES } from '../../../../common/enums/user-role.enum';
import { approvalStepFor, approverStepOf, canRegisterManualResult, ApprovalRecord, controlWindowStart, deriveManagement, ManagementInput, ManagementState } from './management-state';
import { readControl } from './control-readout';
import { APPROVED, control, correct, data, readoutTest, requirement } from './readout.fixtures';

// MD-504 (D132) · La tabla de estados del contrato contracts/cumplimiento/aprobacion.md, fila por fila, con las reglas de vigencia de una aprobación.
const d = (day: string) => new Date(`${day}T12:00:00Z`);
const PERSON = { id: 'u1', name: 'Ana', lastName: 'Pérez' };
const WINDOW = d('2026-11-01');
const act = (patch: Partial<ApprovalRecord>): ApprovalRecord => ({ id: 'a1', step: 'owner', decision: 'approved', reason: null, actor: PERSON, at: d('2026-11-10'), windowStart: WINDOW, invalidatedAt: null, ...patch });
const derive = (patch: Partial<ManagementInput>) => deriveManagement({ complies: false, directFail: false, windowStart: WINDOW, approvals: [], loads: [], ...patch });
const stateOf = (patch: Partial<ManagementInput>): ManagementState => derive(patch).state;

describe('deriveManagement · la tabla de estados (D132)', () => {
  it('non_compliant: el motor no da el 100 % y en la ventana vigente no hay evidencia, resultado ni devolución', () => {
    expect(stateOf({})).toBe('non_compliant');
    expect(stateOf({ loads: [d('2026-10-20')] })).toBe('non_compliant'); // lo de la ventana anterior no cuenta: ventana vencida
  });

  it('non_compliant: también con un check automático Directo en FAIL aunque haya evidencia', () => {
    expect(stateOf({ directFail: true, loads: [d('2026-11-05')] })).toBe('non_compliant');
  });

  it('in_progress: el motor no da el 100 % y en la ventana vigente ya hay evidencia o un resultado', () => {
    expect(stateOf({ loads: [d('2026-11-05')] })).toBe('in_progress');
  });

  it('in_progress sin ventana de calendario: cualquier carga cuenta', () => {
    expect(stateOf({ windowStart: null, approvals: [], loads: [d('2026-01-05')] })).toBe('in_progress');
  });

  it('pending_approval: el motor da el 100 % y no hay una aprobación vigente', () => {
    expect(stateOf({ complies: true, loads: [d('2026-11-05')] })).toBe('pending_approval');
  });

  it('owner_approved: el motor da el 100 % y el responsable aprobó; falta la final', () => {
    const r = derive({ complies: true, approvals: [act({ step: 'owner' })] });
    expect(r.state).toBe('owner_approved');
    expect(r.ownerApproved).toEqual({ by: PERSON, at: d('2026-11-10') });
    expect(r.approved).toBeNull();
  });

  it('approved: el motor da el 100 % y el admin_empresa dio la aprobación final', () => {
    const r = derive({ complies: true, approvals: [act({ step: 'owner', at: d('2026-11-10') }), act({ id: 'a2', step: 'final', at: d('2026-11-11') })] });
    expect(r.state).toBe('approved');
    expect(r.approved?.at).toEqual(d('2026-11-11'));
    expect(r.ownerApproved?.at).toEqual(d('2026-11-10'));
  });

  it('G-05 · la aprobación final sola (el admin es el responsable o no hay responsable) deja el control aprobado', () => {
    expect(stateOf({ complies: true, approvals: [act({ step: 'final' })] })).toBe('approved');
  });

  it('returned: la última decisión de la ventana vigente es una devolución y desde entonces no se cargó nada', () => {
    const ret = act({ id: 'r1', step: 'final', decision: 'returned', reason: 'El acta no está firmada.', at: d('2026-11-12') });
    const r = derive({ complies: true, approvals: [ret], loads: [d('2026-11-05')] });
    expect(r.state).toBe('returned');
    expect(r.returned).toEqual({ reason: 'El acta no está firmada.', by: PERSON, at: d('2026-11-12') });
    // Sigue devuelto aunque el motor ya no dé el 100 % por la entrega devuelta.
    expect(stateOf({ complies: false, approvals: [ret], loads: [d('2026-11-05')] })).toBe('returned');
  });

  it('con una carga nueva después de la devolución sale de returned: in_progress, o pending_approval si el motor ya da el 100 %', () => {
    const ret = act({ step: 'owner', decision: 'returned', reason: 'Falta una evidencia.', at: d('2026-11-12') });
    expect(stateOf({ complies: false, approvals: [ret], loads: [d('2026-11-13')] })).toBe('in_progress');
    expect(stateOf({ complies: true, approvals: [ret], loads: [d('2026-11-13')] })).toBe('pending_approval');
  });

  it('una aprobación posterior a la devolución la deja atrás', () => {
    const ret = act({ id: 'r1', decision: 'returned', reason: 'x', at: d('2026-11-12') });
    expect(stateOf({ complies: true, approvals: [ret, act({ id: 'a2', step: 'final', at: d('2026-11-14') })] })).toBe('approved');
  });
});

describe('deriveManagement · cuándo deja de valer una aprobación (Rod, 2026-11-25)', () => {
  it('una aprobación invalidada (el control dejó de cumplir) no vale: si vuelve a cumplir hay que aprobar de nuevo', () => {
    const invalidated = act({ step: 'final', invalidatedAt: d('2026-11-15') });
    expect(stateOf({ complies: true, approvals: [invalidated] })).toBe('pending_approval');
  });

  it('si el control no cumple, la aprobación no lo deja aprobado', () => {
    expect(stateOf({ complies: false, approvals: [act({ step: 'final' })], loads: [d('2026-11-05')] })).toBe('in_progress');
  });

  it('una aprobación dada en otra ventana no vale en la ventana nueva', () => {
    const delMesPasado = act({ step: 'final', windowStart: d('2026-10-01'), at: d('2026-10-20') });
    expect(stateOf({ complies: true, windowStart: WINDOW, approvals: [delMesPasado] })).toBe('pending_approval');
    expect(stateOf({ complies: true, windowStart: d('2026-10-01'), approvals: [delMesPasado] })).toBe('approved');
  });

  it('una devolución de la ventana anterior tampoco cuenta', () => {
    const vieja = act({ decision: 'returned', reason: 'x', windowStart: d('2026-10-01'), at: d('2026-10-20') });
    expect(stateOf({ complies: true, approvals: [vieja] })).toBe('pending_approval');
  });

  it('sin ventana de calendario (anual, móvil, permanente) la aprobación no caduca por ventana', () => {
    expect(stateOf({ complies: true, windowStart: null, approvals: [act({ step: 'final', windowStart: null })] })).toBe('approved');
  });

  it('una evidencia nueva que no cambia el resultado no quita la aprobación', () => {
    expect(stateOf({ complies: true, approvals: [act({ step: 'final', at: d('2026-11-10') })], loads: [d('2026-11-20')] })).toBe('approved');
  });
});

describe('controlWindowStart · el inicio de la ventana del control', () => {
  it('es el más reciente de las ventanas de calendario de sus requisitos', () => {
    expect(controlWindowStart(['quarterly', 'monthly'], d('2026-11-23'), 'calendar')).toEqual(new Date('2026-11-01T00:00:00Z'));
    expect(controlWindowStart(['quarterly'], d('2026-11-23'), 'calendar')).toEqual(new Date('2026-10-01T00:00:00Z'));
  });

  it('la anual, la permanente y la de evento no tienen ventana que cambie; en rolling tampoco', () => {
    expect(controlWindowStart(['annual', 'permanent', 'on_demand', null], d('2026-11-23'), 'calendar')).toBeNull();
    expect(controlWindowStart(['monthly'], d('2026-11-23'), 'rolling')).toBeNull();
  });
});

describe('approvalStepFor · quién da qué paso (G-05)', () => {
  const owner = { id: 'r1' };
  const admin = { role: 'admin_empresa', userId: 'adm' };
  const resp = { role: 'responsable', userId: 'r1' };
  const withOwner = { owner, executor: null };
  const noOwner = { owner: null, executor: null };

  it('el responsable aprueba sobre pending_approval y da la primera aprobación', () => {
    expect(approvalStepFor(resp, withOwner, 'pending_approval')).toEqual({ step: 'owner' });
  });

  it('el admin_empresa aprueba sobre owner_approved y da la final', () => {
    expect(approvalStepFor(admin, withOwner, 'owner_approved')).toEqual({ step: 'final' });
  });

  it('con otro responsable, el admin_empresa no se salta la primera aprobación: OWNER_APPROVAL_REQUIRED', () => {
    expect(approvalStepFor(admin, withOwner, 'pending_approval')).toEqual({ error: 'OWNER_APPROVAL_REQUIRED' });
  });

  it('sin responsable, o si el admin es el responsable, su aprobación es la única', () => {
    expect(approvalStepFor(admin, noOwner, 'pending_approval')).toEqual({ step: 'final' });
    expect(approvalStepFor({ role: 'admin_empresa', userId: 'adm' }, { owner: { id: 'adm' }, executor: null }, 'pending_approval')).toEqual({ step: 'final' });
  });

  it('un control que no cumple no se aprueba; un paso ya dado responde ALREADY_APPROVED', () => {
    for (const state of ['non_compliant', 'in_progress', 'returned'] as const) {
      expect(approvalStepFor(admin, noOwner, state)).toEqual({ error: 'CONTROL_NOT_COMPLIANT' });
      expect(approvalStepFor(resp, withOwner, state)).toEqual({ error: 'CONTROL_NOT_COMPLIANT' });
    }
    expect(approvalStepFor(admin, withOwner, 'approved')).toEqual({ error: 'ALREADY_APPROVED' });
    expect(approvalStepFor(resp, withOwner, 'owner_approved')).toEqual({ error: 'ALREADY_APPROVED' });
  });

  it('el responsable de otro control y los demás roles no aprueban', () => {
    expect(approvalStepFor({ role: 'responsable', userId: 'otro' }, withOwner, 'pending_approval')).toEqual({ error: 'FORBIDDEN' });
    for (const role of ['delegado', 'auditor', 'colaborador', 'admin_monkey']) expect(approvalStepFor({ role, userId: 'r1' }, withOwner, 'pending_approval')).toEqual({ error: 'FORBIDDEN' });
  });
});

describe('el paso final sale de la matriz (controls.approve_final), no del nombre del rol', () => {
  it('solo quien tiene approve_final sin acotar da el paso final; el responsable dueño da el primero; nadie más actúa', () => {
    const access = { owner: { id: 'u1' }, executor: null };
    const kinds = USER_ROLES.map((role) => [role, approverStepOf({ role, userId: 'u1' }, access)]);
    expect(kinds).toEqual([['admin_monkey', null], ['admin_empresa', 'final'], ['responsable', 'owner'], ['delegado', null], ['auditor', null], ['colaborador', null]]);
    for (const role of USER_ROLES.filter((r) => r !== 'admin_empresa')) {
      for (const state of ['pending_approval', 'owner_approved', 'approved'] as const) expect(approvalStepFor({ role, userId: 'u1' }, access, state)).not.toEqual({ step: 'final' });
    }
  });
});

describe('canRegisterManualResult · quién registra el resultado (D140 punto 2)', () => {
  const owner = { owner: { id: 'r1' }, executor: { id: 'd1' } };
  it('el responsable del control; el delegado, no', () => {
    expect(canRegisterManualResult({ role: 'responsable', userId: 'r1' }, owner)).toBe(true);
    expect(canRegisterManualResult({ role: 'responsable', userId: 'r2' }, owner)).toBe(false);
    expect(canRegisterManualResult({ role: 'delegado', userId: 'd1' }, owner)).toBe(false);
  });
  it('el admin_empresa solo si no hay responsable o si es él', () => {
    expect(canRegisterManualResult({ role: 'admin_empresa', userId: 'adm' }, owner)).toBe(false);
    expect(canRegisterManualResult({ role: 'admin_empresa', userId: 'adm' }, { owner: null, executor: null })).toBe(true);
    expect(canRegisterManualResult({ role: 'admin_empresa', userId: 'adm' }, { owner: { id: 'adm' }, executor: null })).toBe(true);
  });
  it('el auditor, el colaborador y admin_monkey, no', () => {
    for (const role of ['auditor', 'colaborador', 'admin_monkey']) expect(canRegisterManualResult({ role, userId: 'x' }, { owner: null, executor: null })).toBe(false);
  });
});

describe('readControl · el estado de gestión con el motor v2', () => {
  const op = readoutTest('op', 'operational');
  const at = (c: ReturnType<typeof control>) => readControl(c, data([c], []));

  it('un control que cumple y sin aprobación está por aprobar y no cuenta para el resumen', () => {
    const c = control([requirement('r1', [op])], { manualResults: correct('op'), management: { approvals: [], resultDates: [d('2026-11-20')] } });
    const r = at(c);
    expect(r).toMatchObject({ complies: true, managementState: 'pending_approval', state: 'effective', rollupState: 'evaluating' });
  });

  it('con la aprobación final vigente queda aprobado y cuenta como cumplido', () => {
    const c = control([requirement('r1', [op])], { manualResults: correct('op'), management: { ...APPROVED, resultDates: [d('2026-11-20')] } });
    expect(at(c)).toMatchObject({ managementState: 'approved', rollupState: 'effective' });
  });

  it('un control que deja de cumplir (el resultado pasa a excepción) ya no está aprobado ni cuenta', () => {
    const c = control([requirement('r1', [op])], { manualResults: new Map([['op', { result: 'exception' as const, at: d('2026-11-21') }]]), management: { ...APPROVED, resultDates: [d('2026-11-21')] } });
    expect(at(c)).toMatchObject({ complies: false, managementState: 'in_progress', rollupState: 'ineffective' });
  });

  it('sin evidencia ni resultado en la ventana vigente, non_compliant', () => {
    const c = control([requirement('r1', [op], { periodicity: 'monthly' })]);
    expect(at(c)).toMatchObject({ managementState: 'non_compliant' });
  });

  it('una aprobación de la ventana anterior no vale en la ventana nueva del control (mensual)', () => {
    const vieja = { ...APPROVED.approvals[0], windowStart: new Date('2026-10-01T00:00:00Z'), at: d('2026-10-20') };
    const c = control([requirement('r1', [op], { periodicity: 'monthly' })], { manualResults: correct('op'), management: { approvals: [vieja], resultDates: [d('2026-11-20')] } });
    expect(at(c)).toMatchObject({ complies: true, managementState: 'pending_approval' });
  });
});
