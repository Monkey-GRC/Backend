import type { Principal } from '../../../../common/auth/principal';
import { AssignmentCandidates, AssignmentRepository } from '../../domain/assignments/assignment.repository';
import { ControlState } from '../../domain/engine/states';
import { ListAssignmentsUseCase } from './list-assignments.use-case';

// El estado de un control es lo caro de `GET /v1/assignments`: sin `status` solo se pide el de los controles de la página; con `status`, el de todos los que pasaron los demás filtros.
const admin = { userId: 'a', companyId: 'co', role: 'admin_empresa', sessionId: 's' } as Principal;
const control = (n: number) => ({ id: `c${n}`, ownCode: `C${String(n).padStart(2, '0')}`, catalogCode: null, name: `Control ${n}`, requirementCodes: [] });
const candidates: AssignmentCandidates = { services: [{ id: 's1', name: 'Servicio', controls: [1, 2, 3, 4, 5].map(control) }], assignments: new Map(), frameworkRequirements: null };
const stateOf: Record<string, ControlState> = { c1: 'effective', c2: 'ineffective', c3: 'effective', c4: 'no_tests', c5: 'effective' };

function build() {
  const repo = {
    loadCandidates: jest.fn().mockResolvedValue(candidates),
    statesOf: jest.fn().mockImplementation(async (_s: unknown, ids: string[]) => new Map(ids.filter((id) => id !== 'gone').map((id) => [id, stateOf[id]]))),
  };
  return { repo, uc: new ListAssignmentsUseCase(repo as unknown as AssignmentRepository) };
}

describe('ListAssignmentsUseCase', () => {
  it('sin status calcula el estado solo de la página pedida, y el total es el de todos', async () => {
    const { uc, repo } = build();
    const page = await uc.execute(admin, { page: 2, pageSize: 2 });
    expect(page).toMatchObject({ total: 5, page: 2, pageSize: 2 });
    expect(page.items.map((i) => [i.clientControlId, i.state])).toEqual([['c3', 'effective'], ['c4', 'no_tests']]);
    expect(repo.statesOf).toHaveBeenCalledTimes(1);
    expect(repo.statesOf.mock.calls[0][1]).toEqual(['c3', 'c4']);
  });

  it('con status calcula el de todos los candidatos, filtra y pagina después', async () => {
    const { uc, repo } = build();
    const page = await uc.execute(admin, { page: 2, pageSize: 2, status: 'effective' });
    expect(repo.statesOf.mock.calls[0][1]).toEqual(['c1', 'c2', 'c3', 'c4', 'c5']);
    expect(page).toMatchObject({ total: 3, page: 2 });
    expect(page.items.map((i) => i.clientControlId)).toEqual(['c5']);
  });

  it('una página fuera de rango no calcula nada', async () => {
    const { uc, repo } = build();
    expect((await uc.execute(admin, { page: 9, pageSize: 2 })).items).toEqual([]);
    expect(repo.statesOf).not.toHaveBeenCalled();
  });
});
