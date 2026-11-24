import type { Principal } from '../../../../common/auth/principal';
import { AssignedPerson, AssignmentListingData, AssignmentRecord } from '../../domain/assignments/assignment.repository';
import { PARAMS } from '../../domain/controls/readout.fixtures';
import { ReadoutControl } from '../../domain/controls/control-readout';
import { categoryOfRequirement, fold, listAssignments } from './assignment-listing';

const person = (id: string, role = 'responsable'): AssignedPerson => ({ id, name: id, lastName: 'X', role });
const control = (id: string, ownCode: string, patch: Partial<ReadoutControl> = {}): ReadoutControl => ({
  id, serviceId: 's1', ownCode, name: `Control ${ownCode}`, origin: 'catalog', type: 'manual', interpretation: 'x', catalogDescription: 'x', dimensions: [], tests: [], trustCriteria: [], access: { owner: null, executor: null }, approval: 'approved', catalogCode: ownCode, requirementCodes: [], pointsOfFocus: [], evidence: [], ...patch,
});
const admin: Principal = { userId: 'a', companyId: 'co', role: 'admin_empresa', sessionId: 's' };
const as = (role: Principal['role'], userId: string): Principal => ({ ...admin, role, userId });
const page = { page: 1, pageSize: 50 };
const empty = { assets: [], results: new Map(), signals: { now: new Date('2026-11-23T12:00:00Z'), parameters: PARAMS, resultDates: new Map(), exceptions: new Set<string>(), complementaryFails: new Set<string>(), moduleFacts: new Map(), verdicts: new Map() } };

const data = (assignments: Array<[string, AssignmentRecord]> = []): AssignmentListingData => ({
  services: [
    { id: 'sB', name: 'Beta', readout: { serviceId: 'sB', ...empty, controls: [control('b1', 'IAC-2', { requirementCodes: ['CC6.1', 'A1.2'] }), control('b2', 'IAC-10', { requirementCodes: ['C1.1'] })] } },
    { id: 'sA', name: 'Álamo', readout: { serviceId: 'sA', ...empty, controls: [control('a1', 'C02', { origin: 'own', catalogCode: null, name: 'Revisión de cámaras' })] } },
  ],
  assignments: new Map(assignments),
  frameworkRequirements: null,
});
const codes = (p: Principal, d: AssignmentListingData, f: object = {}) => listAssignments(p, d, { ...page, ...f }).items.map((i) => i.clientControlId);

describe('categoryOfRequirement', () => {
  it('son las letras antes del primer dígito', () => {
    expect(['CC6.1', 'A1.2', 'PI1.1', 'P3.2', 'C1.1'].map(categoryOfRequirement)).toEqual(['CC', 'A', 'PI', 'P', 'C']);
  });
});

describe('listAssignments: orden alfabético según el idioma', () => {
  const named = (): AssignmentListingData => ({
    services: [
      { id: 's1', name: 'Ñandú', readout: { serviceId: 's1', ...empty, controls: [control('n1', 'C01')] } },
      { id: 's2', name: 'Nube', readout: { serviceId: 's2', ...empty, controls: [control('n2', 'C01')] } },
      { id: 's3', name: 'Oro', readout: { serviceId: 's3', ...empty, controls: [control('n3', 'C01')] } },
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

describe('listAssignments', () => {
  it('ordena por servicio y luego por código: IAC-2 antes que IAC-10', () => {
    expect(codes(admin, data())).toEqual(['a1', 'b1', 'b2']);
  });

  it('un control propio no tiene requisitos ni categorías; el de catálogo, las de sus requisitos', () => {
    const items = listAssignments(admin, data(), page).items;
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
    expect(listAssignments(admin, d, { ...page }).items.find((i) => i.clientControlId === 'b1')?.owner?.id).toBe('r1');
  });

  it('status filtra sobre el estado calculado y pagina después: un control sin requisitos es no_tests; uno propio sin evidencia está en evaluación', () => {
    expect(codes(admin, data(), { status: 'no_tests' })).toEqual(['b1', 'b2']);
    expect(codes(admin, data(), { status: 'evaluating' })).toEqual(['a1']);
    expect(codes(admin, data(), { status: 'effective' })).toEqual([]);
    const p = listAssignments(admin, data(), { page: 2, pageSize: 1, status: 'no_tests' });
    expect(p).toMatchObject({ total: 2, page: 2, pageSize: 1 });
    expect(p.items.map((i) => i.clientControlId)).toEqual(['b2']);
  });

  it('framework_id usa los requisitos de ese marco', () => {
    const d = { ...data(), frameworkRequirements: new Map([['b1', new Set(['A1.2'])], ['b2', new Set<string>()]]) };
    expect(codes(admin, d, { frameworkId: 'f1' })).toEqual(['b1']);
  });
});
