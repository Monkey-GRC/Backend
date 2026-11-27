import type { Principal } from '../../../../common/auth/principal';
import { ExclusionExpiry, ExclusionRepository } from '../../domain/exclusions/exclusion.repository';
import { ExpireExclusionsUseCase, RequestExclusionUseCase } from './exclusion.use-cases';
import { RequestExclusionDto } from './exclusion.dto';

// MD-501 · Las reglas de la petición que no dependen de la base.
const principal = { companyId: 'c1', userId: 'u1', role: 'admin_empresa' } as Principal;
const meta = { ipAddress: '', userAgent: '' };
const NOW = new Date('2026-11-27T15:00:00Z');
const dto = (over: Partial<RequestExclusionDto> = {}): RequestExclusionDto => ({ test_id: 't', asset_id: 'a', justification: 'j', technical_justification: 'tj', valid_until: '2026-12-31', ...over });
const fieldsOf = async (p: Promise<unknown>) => (await p.then(() => null, (e) => e)).fields;

describe('RequestExclusionUseCase', () => {
  const create = jest.fn().mockResolvedValue({});
  const useCase = new RequestExclusionUseCase({ create } as unknown as ExclusionRepository);
  beforeEach(() => create.mockClear());

  it('la fecha de fin debe ser posterior a hoy (date.min)', async () => {
    expect(await fieldsOf(useCase.execute(principal, 's', dto({ valid_until: '2026-11-27' }), meta, NOW))).toEqual([{ field: 'valid_until', code: 'date.min' }]);
    expect(await fieldsOf(useCase.execute(principal, 's', dto({ valid_until: '2026-11-01' }), meta, NOW))).toEqual([{ field: 'valid_until', code: 'date.min' }]);
    expect(create).not.toHaveBeenCalled();
  });
  it('la justificación y el sustento técnico no van vacíos (required)', async () => {
    expect(await fieldsOf(useCase.execute(principal, 's', dto({ justification: '  ' }), meta, NOW))).toEqual([{ field: 'justification', code: 'required' }]);
    expect(await fieldsOf(useCase.execute(principal, 's', dto({ technical_justification: ' ' }), meta, NOW))).toEqual([{ field: 'technical_justification', code: 'required' }]);
  });
  it('pasa la fecha como día UTC y los textos sin espacios sobrantes', async () => {
    await useCase.execute(principal, 's', dto({ technical_justification: ' sustento ' }), meta, NOW);
    expect(create.mock.calls[0][2]).toMatchObject({ validUntil: new Date('2026-12-31T00:00:00.000Z'), technicalJustification: 'sustento' });
  });
});

describe('ExpireExclusionsUseCase', () => {
  it('cada empresa va aparte: si una falla la siguiente corre, y la pasada devuelve lo registrado', async () => {
    const expireTenant = jest.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(2);
    const useCase = new ExpireExclusionsUseCase({ listTenantIds: async () => ['t1', 't2'], expireTenant } as unknown as ExclusionExpiry);
    expect(await useCase.execute(NOW)).toEqual({ tenants: 1, failed: 1, expired: 2 });
    expect(expireTenant).toHaveBeenCalledWith('t2', NOW);
  });

  it('`tenantIds` se pasa al repositorio: el filtro va en la consulta y `[]` no recorre ninguna empresa', async () => {
    const listTenantIds = jest.fn(async (only?: readonly string[]) => (only ? only.filter((id) => ['t1', 't2'].includes(id)) : ['t1', 't2']));
    const expireTenant = jest.fn().mockResolvedValue(0);
    const useCase = new ExpireExclusionsUseCase({ listTenantIds, expireTenant } as unknown as ExclusionExpiry);
    expect(await useCase.execute(NOW, [])).toEqual({ tenants: 0, failed: 0, expired: 0 });
    expect(listTenantIds).toHaveBeenCalledWith([]);
    expect(expireTenant).not.toHaveBeenCalled();
  });
});
