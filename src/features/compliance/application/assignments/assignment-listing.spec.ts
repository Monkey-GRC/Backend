import type { Principal } from '../../../../common/auth/principal';
import { AssignedPerson, AssignmentCandidate, AssignmentCandidates, AssignmentRecord } from '../../domain/assignments/assignment.repository';
import { categoryOfRequirement, fold, pickAssignments } from './assignment-listing';

const person = (id: string, role = 'responsable'): AssignedPerson => ({ id, name: id, lastName: 'X', role });
const control = (id: string, ownCode: string, patch: Partial<AssignmentCandidate> = {}): AssignmentCandidate => ({ id, ownCode, catalogCode: ownCode, name: `Control ${ownCode}`, requirementCodes: [], ...patch });
const admin: Principal = { userId: 'a', companyId: 'co', role: 'admin_empresa', sessionId: 's' };
const as = (role: Principal['role'], userId: string): Principal => ({ ...admin, role, userId });
const page = { page: 1, pageSize: 50 };
const data = (assignments: Array<[string, AssignmentRecord]> = []): AssignmentCandidates => ({
  services: [
    { id: 'sB', name: 'Beta', controls: [control('b1', 'IAC-2', { requirementCodes: ['CC6.1', 'A1.2'] }), control('b2', 'IAC-10', { requirementCodes: ['C1.1'] })] },
    { id: 'sA', name: 'Álamo', controls: [control('a1', 'C02', { catalogCode: null, name: 'Revisión de cámaras' })] },
  ],
  assignments: new Map(assignments),
  frameworkRequirements: null,
});
const codes = (p: Principal, d: AssignmentCandidates, f: object = {}) => pickAssignments(p, d, { ...page, ...f }).map((i) => i.clientControlId);

describe('categoryOfRequirement', () => {
  it('son las letras antes del primer dígito', () => {
    expect(['CC6.1', 'A1.2', 'PI1.1', 'P3.2', 'C1.1'].map(categoryOfRequirement)).toEqual(['CC', 'A', 'PI', 'P', 'C']);
  });
});

describe('pickAssignments: orden alfabético según el idioma', () => {
  const named = (): AssignmentCandidates => ({
    services: [
      { id: 's1', name: 'Ñandú', controls: [control('n1', 'C01')] },
      { id: 's2', name: 'Nube', controls: [control('n2', 'C01')] },
      { id: 's3', name: 'Oro', controls: [control('n3', 'C01')] },
    ],
    assignments: new Map(),
    frameworkRequirements: null,
  });
  it('en español la ñ va después de la n; en inglés es una n con tilde y va antes de «Nube»', () => {
    expect(codes(admin, named(), { locale: 'es' })).toEqual(['n2', 'n1', 'n3']);
    expect(codes(admin, named(), { locale: 'en' })).toEqual(['n1', 'n2', 'n3']);
    expect(codes(admin, named())).toEqual(['n2', 'n1', 'n3']);
  });
});

describe('pickAssignments', () => {
  it('ordena por servicio y luego por código: IAC-2 antes que IAC-10', () => {
    expect(codes(admin, data())).toEqual(['a1', 'b1', 'b2']);
  });

  it('un control propio no tiene requisitos ni categorías; el de catálogo, las de sus requisitos', () => {
    const items = pickAssignments(admin, data(), page);
    expect(items[0]).toMatchObject({ code: 'C02', requirementCodes: [], categories: [], assignment: 'unassigned', owner: null, executor: null });
    expect(items[1]).toMatchObject({ code: 'IAC-2', requirementCodes: ['CC6.1', 'A1.2'], categories: ['A', 'CC'] });
  });

  it('category toma el prefijo exacto: CC no toma C1.1 y un control propio no entra', () => {
    expect(codes(admin, data(), { category: 'CC' })).toEqual(['b1']);
    expect(codes(admin, data(), { category: 'C' })).toEqual(['b2']);
    expect(codes(admin, data(), { requirementCode: 'A1.2' })).toEqual(['b1']);
  });

  it('q busca sin distinguir mayúsculas ni acentos en el código, los requisitos y el nombre', () => {
    expect(codes(admin, data(), { q: 'iac-1' })).toEqual(['b2']);
    expect(codes(admin, data(), { q: 'cc6' })).toEqual(['b1']);
    expect(codes(admin, data(), { q: 'REVISION DE CAMARAS' })).toEqual(['a1']);
    expect(fold('Álamo')).toBe('alamo');
  });

  it('assignment, owner_id y executor_id se combinan', () => {
    const d = data([['b1', { owner: person('r1'), executor: person('d1', 'delegado'), ownerActive: true, executorActive: true }], ['b2', { owner: person('r1'), executor: null, ownerActive: true, executorActive: false }]]);
    expect(codes(admin, d, { assignment: 'unassigned' })).toEqual(['a1']);
    expect(codes(admin, d, { assignment: 'assigned', executorId: 'd1' })).toEqual(['b1']);
    expect(codes(admin, d, { ownerId: 'r1', category: 'C' })).toEqual(['b2']);
  });

  it('un responsable ve los suyos; un delegado, los que ejecuta; el auditor, todos', () => {
    const d = data([['b1', { owner: person('r1'), executor: person('d1', 'delegado'), ownerActive: true, executorActive: true }], ['b2', { owner: person('r2'), executor: null, ownerActive: true, executorActive: false }]]);
    expect(codes(as('responsable', 'r1'), d)).toEqual(['b1']);
    expect(codes(as('delegado', 'd1'), d)).toEqual(['b1']);
    expect(codes(as('delegado', 'd2'), d)).toEqual([]);
    expect(codes(as('auditor', 'x'), d)).toEqual(['a1', 'b1', 'b2']);
  });

  it('una persona dada de baja no hace ver el control, pero el administrador lo sigue viendo con ella', () => {
    const d = data([['b1', { owner: person('r1'), executor: person('d1', 'delegado'), ownerActive: false, executorActive: false }]]);
    expect(codes(as('responsable', 'r1'), d)).toEqual([]);
    expect(codes(as('delegado', 'd1'), d)).toEqual([]);
    expect(pickAssignments(admin, d, { ...page }).find((i) => i.clientControlId === 'b1')?.owner?.id).toBe('r1');
  });

  it('framework_id usa los requisitos de ese marco', () => {
    const d = { ...data(), frameworkRequirements: new Map([['b1', new Set(['A1.2'])], ['b2', new Set<string>()]]) };
    expect(codes(admin, d, { frameworkId: 'f1' })).toEqual(['b1']);
  });
});
