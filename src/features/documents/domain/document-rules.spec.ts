import { assignmentStatus, dueAtOf, isEligibleAssignee, mayReadVersionFile, MY_STATUS_ORDER } from './document-rules';

const at = (iso: string) => new Date(iso);

describe('assignmentStatus (derivado, D152)', () => {
  const dueAt = at('2026-12-01T00:00:00Z');
  it('aceptó la versión vigente → accepted, aunque ya pasara el plazo', () => {
    expect(assignmentStatus({ requiresAcceptance: true, accepted: true, dueAt, now: at('2027-01-01T00:00:00Z') })).toBe('accepted');
  });
  it('sin aceptar: dentro del plazo (incluido el instante límite) pending; después overdue', () => {
    expect(assignmentStatus({ requiresAcceptance: true, accepted: false, dueAt, now: at('2026-11-30T00:00:00Z') })).toBe('pending');
    expect(assignmentStatus({ requiresAcceptance: true, accepted: false, dueAt, now: dueAt })).toBe('pending');
    expect(assignmentStatus({ requiresAcceptance: true, accepted: false, dueAt, now: at('2026-12-01T00:00:01Z') })).toBe('overdue');
  });
  it('un documento que no pide aceptación no tiene estado (null), ni vencido el plazo', () => {
    expect(assignmentStatus({ requiresAcceptance: false, accepted: false, dueAt, now: at('2027-01-01T00:00:00Z') })).toBeNull();
  });

  it('el orden de «Mis documentos»: vencidos, pendientes, aceptados', () => {
    expect(MY_STATUS_ORDER.overdue).toBeLessThan(MY_STATUS_ORDER.pending);
    expect(MY_STATUS_ORDER.pending).toBeLessThan(MY_STATUS_ORDER.accepted);
  });
});

describe('dueAtOf (PR-14)', () => {
  it('suma los días de PR-14 a la asignación', () => {
    expect(dueAtOf(at('2026-11-25T10:00:00Z'), 30).toISOString()).toBe('2026-12-25T10:00:00.000Z');
  });
});

describe('isEligibleAssignee', () => {
  it.each(['admin_empresa', 'responsable', 'delegado', 'colaborador'])('%s activo o pendiente sí', (role) => {
    expect(isEligibleAssignee({ role, status: 'active' })).toBe(true);
    expect(isEligibleAssignee({ role, status: 'pending' })).toBe(true);
    expect(isEligibleAssignee({ role, status: 'inactive' })).toBe(false);
    expect(isEligibleAssignee({ role, status: 'suspended' })).toBe(false);
  });
  it('el auditor y admin_monkey nunca (no aceptan, D133)', () => {
    expect(isEligibleAssignee({ role: 'auditor', status: 'active' })).toBe(false);
    expect(isEligibleAssignee({ role: 'admin_monkey', status: 'active' })).toBe(false);
  });
});

describe('mayReadVersionFile', () => {
  it('admin_empresa y auditor ven cualquier versión', () => {
    for (const role of ['admin_empresa', 'auditor']) expect(mayReadVersionFile({ role, assigned: false, isCurrent: false, acceptedByMe: false })).toBe(true);
  });
  it('los asignados ven la vigente o una que aceptaron; sin asignación o con otra versión, no', () => {
    for (const role of ['responsable', 'delegado', 'colaborador']) {
      expect(mayReadVersionFile({ role, assigned: true, isCurrent: true, acceptedByMe: false })).toBe(true);
      expect(mayReadVersionFile({ role, assigned: true, isCurrent: false, acceptedByMe: true })).toBe(true);
      expect(mayReadVersionFile({ role, assigned: true, isCurrent: false, acceptedByMe: false })).toBe(false);
      expect(mayReadVersionFile({ role, assigned: false, isCurrent: true, acceptedByMe: true })).toBe(false);
    }
  });
  it('admin_monkey no', () => {
    expect(mayReadVersionFile({ role: 'admin_monkey', assigned: true, isCurrent: true, acceptedByMe: true })).toBe(false);
  });
});
