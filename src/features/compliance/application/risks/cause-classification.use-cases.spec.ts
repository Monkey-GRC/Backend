import type { Principal } from '../../../../common/auth/principal';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { CreateCauseUseCase, GetCauseUseCase, UpdateCauseUseCase } from './risk.use-cases';

// MD-499 · La clasificación (cause_origin, cause_type) llega al repositorio tal como la mandó el cliente; `null` borra.
const p = { companyId: 'c', userId: 'u', role: 'admin_empresa' } as Principal;
const meta = { ipAddress: '1.1.1.1', userAgent: 'jest' } as RequestMeta;
const get = { execute: jest.fn().mockResolvedValue({}) } as unknown as GetCauseUseCase;

describe('clasificación de la causa (MD-499)', () => {
  it('al crear, pasa origen y tipo; sin ellos, null', async () => {
    const repo = { createCause: jest.fn().mockResolvedValue({ id: 'x' }) };
    const uc = new CreateCauseUseCase(repo as never, get);
    await uc.execute(p, 's', { name: ' n ', description: 'd', failure_category: 'human_resource', cause_origin: 'internal', cause_type: 'human' }, meta);
    expect(repo.createCause.mock.calls[0][2]).toMatchObject({ name: 'n', causeOrigin: 'internal', causeType: 'human' });
    await uc.execute(p, 's', { name: 'n', description: 'd', failure_category: 'human_resource' }, meta);
    expect(repo.createCause.mock.calls[1][2]).toMatchObject({ causeOrigin: null, causeType: null });
  });

  it('al editar, solo manda lo que vino y respeta el null; la auditoría lleva before/after', async () => {
    const change = { before: { causeOrigin: 'internal' }, after: { causeOrigin: null } };
    const repo = { updateCause: jest.fn().mockImplementation(async (_s, _i, _patch, audit) => { audit(change); return change; }) };
    const uc = new UpdateCauseUseCase(repo as never, get);
    await uc.execute(p, 'id', { cause_origin: null }, meta);
    const [, , patch, auditFn] = repo.updateCause.mock.calls[0];
    expect(patch).toEqual({ causeOrigin: null });
    expect(auditFn(change)).toMatchObject({ action: 'client_cause.update', beforeState: change.before, afterState: change.after });
    await uc.execute(p, 'id', { cause_type: 'human' }, meta);
    expect(repo.updateCause.mock.calls[1][2]).toEqual({ causeType: 'human' });
  });

  it('la causa del catálogo rechaza clasificar con 422 desde el caso de uso (dentro de la transacción del repositorio); la propia, no', async () => {
    const repo = { updateCause: jest.fn().mockImplementation(async (_s, _i, _patch, _audit, guard) => { guard({ fromCatalog: true }); return null; }) };
    const uc = new UpdateCauseUseCase(repo as never, get);
    await expect(uc.execute(p, 'id', { cause_origin: 'external' }, meta)).rejects.toBeInstanceOf(ValidationException);
    await expect(uc.execute(p, 'id', { cause_origin: 'external' }, meta)).rejects.toMatchObject({ fields: [{ field: 'cause_origin', code: 'cause.catalog_classification' }] });
    repo.updateCause.mockImplementation(async (_s, _i, _patch, _audit, guard) => { guard({ fromCatalog: false }); return { before: {}, after: {} }; });
    await expect(uc.execute(p, 'id', { cause_origin: 'external' }, meta)).resolves.toBeDefined();
  });
});
