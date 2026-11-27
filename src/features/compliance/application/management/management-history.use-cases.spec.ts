import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { ListManagementHistoryUseCase, ListOccurrencesUseCase, ManagementHistoryQuery, OccurrencesQuery } from './management-history.use-cases';

// MD-529 · Lectura: 404 (no existe) → 403 (no es de quien lee) → 422 (fechas) → la consulta, y los niveles solo para quien los ve.
const parts = { owner: { id: 'r1', name: 'Ana', lastName: 'P', role: 'responsable' }, executor: { id: 'd1', name: 'Luis', lastName: 'G', role: 'delegado' } };
const who = (role: Principal['role'], userId: string): Principal => ({ userId, companyId: 'co', role, sessionId: 's' });
const query = (patch: Partial<ManagementHistoryQuery> = {}): ManagementHistoryQuery => Object.assign(new ManagementHistoryQuery(), patch);
const outcome = async (p: Promise<unknown>) => p.then(() => 'ok', (e: unknown) => (e instanceof DomainError ? e.code : e instanceof ValidationException ? e.fields[0].code : String(e)));

function repo(access: unknown = parts) {
  return { controlAccess: jest.fn().mockResolvedValue(access), history: jest.fn().mockResolvedValue({ items: [], total: 0 }), occurrences: jest.fn().mockResolvedValue({ items: [], total: 0, requirement: { id: 'q', code: 'X-L1' } }) };
}

describe('ListManagementHistoryUseCase', () => {
  it('404 si el control no existe y 403 si es de la empresa pero no suyo (responsable ajeno, delegado ajeno, colaborador)', async () => {
    expect(await outcome(new ListManagementHistoryUseCase(repo(null) as never).execute(who('admin_empresa', 'a1'), 'c1', query()))).toBe('NOT_FOUND');
    for (const p of [who('responsable', 'r9'), who('delegado', 'd9'), who('colaborador', 'x1')]) expect(await outcome(new ListManagementHistoryUseCase(repo() as never).execute(p, 'c1', query()))).toBe('FORBIDDEN');
  });
  it('422 si `from` es posterior a `to`, antes de consultar', async () => {
    const r = repo();
    expect(await outcome(new ListManagementHistoryUseCase(r as never).execute(who('admin_empresa', 'a1'), 'c1', query({ from: '2026-12-01', to: '2026-11-01' })))).toBe('to.before_from');
    expect(r.history).not.toHaveBeenCalled();
  });
  it('los niveles solo salen para el auditor, el admin y el responsable dueño; el delegado no los ve', async () => {
    const seen = async (p: Principal) => {
      const r = repo();
      await new ListManagementHistoryUseCase(r as never).execute(p, 'c1', query());
      return (r.history.mock.calls[0][2] as { includeLevels: boolean }).includeLevels;
    };
    expect(await seen(who('admin_empresa', 'a1'))).toBe(true);
    expect(await seen(who('auditor', 'u1'))).toBe(true);
    expect(await seen(who('responsable', 'r1'))).toBe(true);
    expect(await seen(who('delegado', 'd1'))).toBe(false);
  });
});

describe('ListOccurrencesUseCase', () => {
  it('404 sin control, 403 de un ajeno y 404 sin requisito', async () => {
    expect(await outcome(new ListOccurrencesUseCase(repo(null) as never).execute(who('admin_empresa', 'a1'), 'c1', 'q', new OccurrencesQuery()))).toBe('NOT_FOUND');
    expect(await outcome(new ListOccurrencesUseCase(repo() as never).execute(who('responsable', 'r9'), 'c1', 'q', new OccurrencesQuery()))).toBe('FORBIDDEN');
    const sinRequisito = repo();
    sinRequisito.occurrences.mockResolvedValue(null);
    expect(await outcome(new ListOccurrencesUseCase(sinRequisito as never).execute(who('admin_empresa', 'a1'), 'c1', 'q', new OccurrencesQuery()))).toBe('NOT_FOUND');
  });
});
