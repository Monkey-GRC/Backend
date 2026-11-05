import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { CompanyDetail } from '../../domain/entities/company-overview';
import { Company } from '../../domain/entities/company.entity';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import type { CompanyRepository } from '../../domain/repositories/company.repository';
import { UpdateMaxUsersUseCase } from './update-max-users.use-case';

// D103 · Cambiar el cupo. La comparación con las cuentas que cuentan vive en el repositorio (con la fila bloqueada); aquí se prueba qué pide el caso
// de uso y qué deja en la auditoría. El cupo contra concurrencia real lo prueban las e2e.

const ID = '11111111-1111-4111-8111-111111111111';
const principal: Principal = { userId: 'u-monkey', companyId: 'c-monkey', role: 'admin_monkey', sessionId: 's1' };
const meta = { ipAddress: '10.0.0.1', userAgent: 'jest' };

const detail = (maxUsers: number): CompanyDetail => ({
  company: new Company(ID, 'Acme S.A.S.', 'a@acme.test', 'shared', 'active', new Date(), new Date(), null, maxUsers),
  currentAccessKey: null,
  frameworks: [],
  onboardingCompleted: false,
  usersCount: 5,
  accessKeys: [],
});

type Intent = AuditIntent<{ before: number | null; after: number }>;

function build(opts: { usersCount: number; before: number | null }) {
  let stored = opts.before;
  const audits: AuditEntry[] = [];
  const repo = {
    updateMaxUsers: jest.fn(async (_s: unknown, id: string, _x: string, max: number, audit: Intent) => {
      if (id !== ID) throw new DomainError('NOT_FOUND');
      if (max < opts.usersCount) throw new DomainError('MAX_USERS_BELOW_CURRENT', { max_users: max, users_count: opts.usersCount });
      const before = stored;
      stored = max;
      audits.push(...[audit({ before, after: max })].flat());
    }),
    findById: jest.fn(async () => detail(stored as number)),
  };
  return { useCase: new UpdateMaxUsersUseCase(repo as unknown as CompanyRepository), repo, audits };
}

describe('UpdateMaxUsersUseCase', () => {
  it('por debajo de las cuentas que cuentan: 409 MAX_USERS_BELOW_CURRENT, sin auditoría ni cambio', async () => {
    const { useCase, audits } = build({ usersCount: 5, before: 10 });
    await expect(useCase.execute(principal, ID, 4, meta)).rejects.toMatchObject({ code: 'MAX_USERS_BELOW_CURRENT', details: { max_users: 4, users_count: 5 } });
    expect(audits).toHaveLength(0);
  });

  it.each([5, 6])('igual o por encima (%i): actualiza y devuelve la empresa', async (max) => {
    const { useCase } = build({ usersCount: 5, before: 10 });
    const result = await useCase.execute(principal, ID, max, meta);
    expect(result.company.maxUsers).toBe(max);
  });

  it('empresa inexistente: 404', async () => {
    const { useCase } = build({ usersCount: 0, before: 10 });
    await expect(useCase.execute(principal, '22222222-2222-4222-8222-222222222222', 5, meta)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('audita company.max_users_update con el valor de antes y el de después, como acción de plataforma', async () => {
    const { useCase, audits } = build({ usersCount: 1, before: 10 });
    await useCase.execute(principal, ID, 25, meta);
    expect(audits).toEqual([
      expect.objectContaining({
        tenantId: null,
        userId: 'u-monkey',
        action: 'company.max_users_update',
        resource: 'company',
        result: 'success',
        beforeState: { company_id: ID, max_users: 10 },
        afterState: { company_id: ID, max_users: 25 },
      }),
    ]);
  });

  it('empresa sin cupo previo (NULL): el antes se audita como null', async () => {
    const { useCase, audits } = build({ usersCount: 1, before: null });
    await useCase.execute(principal, ID, 3, meta);
    expect(audits[0].beforeState).toEqual({ company_id: ID, max_users: null });
  });
});
