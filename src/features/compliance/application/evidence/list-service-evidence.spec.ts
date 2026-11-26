import type { Principal } from '../../../../common/auth/principal';
import { EvidenceRepository, RequirementRecord, ServiceEvidence } from '../../domain/evidence/evidence.repository';
import { ListServiceEvidenceUseCase } from './evidence.use-cases';

const req = (id: string, sequence: number, dimension = 'policy') => ({ id, sequence, dimension, submissions: [] }) as unknown as RequirementRecord;
const data: ServiceEvidence = {
  controls: [
    { id: 'c10', ownCode: 'IAC-10', access: { owner: { id: 'u2', name: null, lastName: null, role: 'responsable' }, executor: null } },
    { id: 'c2', ownCode: 'IAC-2', access: { owner: { id: 'u1', name: null, lastName: null, role: 'responsable' }, executor: null } },
  ],
  items: [
    { controlId: 'c10', requirement: req('r10', 1) },
    { controlId: 'c2', requirement: req('r2b', 2) },
    { controlId: 'c2', requirement: req('r2a', 1) },
  ],
};
const useCase = (found: ServiceEvidence | null) => new ListServiceEvidenceUseCase({ listByService: async () => found } as unknown as EvidenceRepository);
const who = (role: Principal['role'], userId = 'u1') => ({ companyId: 'co', userId, role }) as Principal;

describe('ListServiceEvidenceUseCase (MD-208)', () => {
  it('el administrador ve todo: controles por código (IAC-2 antes que IAC-10) y luego sequence', async () => {
    const { items } = await useCase(data).execute(who('admin_empresa'), 's');
    expect(items.map((i) => i.requirement.id)).toEqual(['r2a', 'r2b', 'r10']);
  });

  it('el responsable y el delegado solo ven los controles que atienden', async () => {
    expect((await useCase(data).execute(who('responsable', 'u2'), 's')).items.map((i) => i.controlId)).toEqual(['c10']);
    expect((await useCase(data).execute(who('delegado', 'u1'), 's')).items.map((i) => i.controlId)).toEqual(['c2', 'c2']);
  });

  it('servicio inexistente: NOT_FOUND', async () => {
    await expect(useCase(null).execute(who('admin_empresa'), 's')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
