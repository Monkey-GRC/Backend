import type { AuditEntry, AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import type { CredentialCipher } from '../../../../common/security/credential-cipher';
import type { FileStorage } from '../../../../common/storage/file-storage';
import type { StepUp } from '../../../auth/application/services/step-up.service';
import { CompanyDetail } from '../../domain/entities/company-overview';
import { Company } from '../../domain/entities/company.entity';
import type { CompanyRepository } from '../../domain/repositories/company.repository';
import { ArchiveCompanyUseCase } from './archive-company.use-case';
import { PurgeExpiredCompaniesUseCase } from './purge-expired-companies.use-case';
import { ReactivateCompanyUseCase } from './reactivate-company.use-case';

// D97 · El flujo de archivar, reactivar y borrar, sin base de datos: lo que cada caso de uso hace, en qué orden y qué deshace si algo falla.
// Lo que la base garantiza (candado, condiciones del UPDATE, borrado real) lo demuestra `test/auditoria/archivar-empresa*.e2e-spec.ts`.

const ID = '11111111-1111-4111-8111-111111111111';
const principal: Principal = { userId: 'u-monkey', companyId: 'c-monkey', role: 'admin_monkey', sessionId: 's1' };
const meta = { ipAddress: '10.0.0.1', userAgent: 'jest' };
const DAY = 86_400_000;

function detail(status: 'active' | 'deactivated', archiveUntil?: Date): CompanyDetail {
  const archive = status === 'deactivated' ? { deactivatedAt: new Date(), archiveUntil: archiveUntil ?? new Date(Date.now() + DAY), reasonCode: 'non_payment' as const, reason: 'Facturas.' } : null;
  return { company: new Company(ID, 'Acme S.A.S.', 'a@acme.test', 'shared', status, new Date(), new Date(), archive), currentAccessKey: null, frameworks: [], onboardingCompleted: false, accessKeys: [] };
}

const calls: string[] = [];
let repo: jest.Mocked<Pick<CompanyRepository, 'findById' | 'exportSnapshot' | 'archive' | 'reactivate' | 'listArchived' | 'purge'>>;
let storage: jest.Mocked<Pick<FileStorage, 'put' | 'remove' | 'removePrefix'>>;
let stepUp: { assert: jest.Mock };
let audit: { write: jest.Mock };
const cipher = { encrypt: jest.fn((v: unknown) => `v1.${JSON.stringify(v).length}`) } as unknown as CredentialCipher;

beforeEach(() => {
  calls.length = 0;
  repo = {
    findById: jest.fn(),
    exportSnapshot: jest.fn(async () => ({ company: { id: ID } })),
    archive: jest.fn(async () => {
      calls.push('repo.archive');
      return 3;
    }),
    reactivate: jest.fn(async () => {
      calls.push('repo.reactivate');
      return 'snapshot-key';
    }),
    listArchived: jest.fn(),
    purge: jest.fn(),
  };
  storage = {
    put: jest.fn(async () => {
      calls.push('storage.put');
    }),
    remove: jest.fn(async () => {
      calls.push('storage.remove');
    }),
    removePrefix: jest.fn(async () => {
      calls.push('storage.removePrefix');
    }),
  };
  stepUp = {
    assert: jest.fn(async () => {
      calls.push('stepUp');
    }),
  };
  audit = { write: jest.fn(async () => undefined) };
});

const asRepo = () => repo as unknown as CompanyRepository;
const asStorage = () => storage as unknown as FileStorage;
const codeOf = async (p: Promise<unknown>) => (await p.then(() => null, (e: unknown) => e)) as DomainError | null;

describe('ArchiveCompanyUseCase', () => {
  const input = { confirmName: 'Acme S.A.S.', reasonCode: 'non_payment' as const, reason: 'Dos facturas vencidas.', retentionDays: 30 };
  const build = () => new ArchiveCompanyUseCase(asRepo(), stepUp as unknown as StepUp, cipher, asStorage(), audit as unknown as AuditLogWriter);

  it('guarda la copia ANTES de archivar, con una llave única bajo el prefijo de la empresa, y luego pide el estado nuevo', async () => {
    repo.findById.mockResolvedValueOnce(detail('active')).mockResolvedValueOnce(detail('deactivated'));
    const result = await build().execute(principal, ID, input, meta);

    expect(calls).toEqual(['stepUp', 'storage.put', 'repo.archive']);
    const [key] = storage.put.mock.calls[0];
    expect(key).toMatch(new RegExp(`^${ID}/archive/.+-[0-9a-f-]{36}\\.snapshot$`));
    const data = repo.archive.mock.calls[0][2];
    expect(data.snapshotKey).toBe(key);
    expect(data.archiveUntil.getTime() - data.at.getTime()).toBe(30 * DAY);
    expect(result.company.status).toBe('deactivated');
  });

  it('dos archivados seguidos usan llaves distintas: el que pierda no puede borrar la copia del que ganó', async () => {
    repo.findById.mockResolvedValue(detail('active'));
    await Promise.all([build().execute(principal, ID, input, meta), build().execute(principal, ID, input, meta)]);
    const [a, b] = storage.put.mock.calls.map(([key]) => key);
    expect(a).not.toBe(b);
  });

  it('la auditoría de éxito lleva lo mínimo: el motivo en texto libre no sale de la fila de la empresa', async () => {
    repo.findById.mockResolvedValueOnce(detail('active')).mockResolvedValueOnce(detail('deactivated'));
    await build().execute(principal, ID, input, meta);
    const entry = repo.archive.mock.calls[0][3]({ sessionsClosed: 3 }) as AuditEntry;
    expect(entry).toMatchObject({ tenantId: null, userId: 'u-monkey', action: 'company.deactivate', result: 'success' });
    expect(entry.afterState).toMatchObject({ company_id: ID, status: 'deactivated', reason_code: 'non_payment', sessions_closed: 3 });
    expect(JSON.stringify(entry)).not.toContain('facturas');
  });

  it('si la transacción falla, borra la copia que acababa de guardar y propaga el error', async () => {
    repo.findById.mockResolvedValue(detail('active'));
    repo.archive.mockRejectedValueOnce(new DomainError('COMPANY_ALREADY_DEACTIVATED'));
    const error = await codeOf(build().execute(principal, ID, input, meta));
    expect(error?.code).toBe('COMPANY_ALREADY_DEACTIVATED');
    expect(storage.remove).toHaveBeenCalledWith(storage.put.mock.calls[0][0]);
  });

  it('si la copia no se puede guardar, no se archiva', async () => {
    repo.findById.mockResolvedValue(detail('active'));
    storage.put.mockRejectedValueOnce(new DomainError('STORAGE_UNAVAILABLE'));
    expect((await codeOf(build().execute(principal, ID, input, meta)))?.code).toBe('STORAGE_UNAVAILABLE');
    expect(repo.archive).not.toHaveBeenCalled();
  });

  it('razón social distinta: rechaza, deja rastro del intento sin lo escrito y no toca nada más', async () => {
    repo.findById.mockResolvedValue(detail('active'));
    const error = await codeOf(build().execute(principal, ID, { ...input, confirmName: 'acme' }, meta));
    expect(error?.code).toBe('CONFIRMATION_MISMATCH');
    expect(audit.write).toHaveBeenCalledWith(expect.objectContaining({ action: 'company.deactivate', result: 'error', userId: 'u-monkey', afterState: { company_id: ID, reason: 'confirmation_mismatch' } }));
    expect(JSON.stringify(audit.write.mock.calls)).not.toContain('"acme"');
    expect(stepUp.assert).not.toHaveBeenCalled();
    expect(storage.put).not.toHaveBeenCalled();
    expect(repo.archive).not.toHaveBeenCalled();
  });

  it('ya archivada: 409 con rastro del intento, sin pedir el código ni guardar copia', async () => {
    repo.findById.mockResolvedValue(detail('deactivated'));
    expect((await codeOf(build().execute(principal, ID, input, meta)))?.code).toBe('COMPANY_ALREADY_DEACTIVATED');
    expect(audit.write).toHaveBeenCalledWith(expect.objectContaining({ result: 'error', afterState: { company_id: ID, reason: 'already_deactivated' } }));
    expect(stepUp.assert).not.toHaveBeenCalled();
    expect(storage.put).not.toHaveBeenCalled();
  });

  it('la empresa interna o inexistente responde NOT_FOUND y no deja rastro', async () => {
    repo.findById.mockResolvedValue(null);
    expect((await codeOf(build().execute(principal, ID, input, meta)))?.code).toBe('NOT_FOUND');
    expect(audit.write).not.toHaveBeenCalled();
  });

  it('un código TOTP equivocado detiene todo antes de guardar la copia', async () => {
    repo.findById.mockResolvedValue(detail('active'));
    stepUp.assert.mockRejectedValueOnce(new DomainError('MFA_CODE_INVALID'));
    expect((await codeOf(build().execute(principal, ID, input, meta)))?.code).toBe('MFA_CODE_INVALID');
    expect(storage.put).not.toHaveBeenCalled();
    expect(repo.archive).not.toHaveBeenCalled();
  });
});

describe('ReactivateCompanyUseCase', () => {
  const build = () => new ReactivateCompanyUseCase(asRepo(), stepUp as unknown as StepUp, asStorage());
  const input = { reason: 'Pagó la deuda.' };

  it('dentro del plazo: pide el código, reactiva y recién después borra la copia', async () => {
    repo.findById.mockResolvedValueOnce(detail('deactivated')).mockResolvedValueOnce(detail('active'));
    const result = await build().execute(principal, ID, input, meta);
    expect(calls).toEqual(['stepUp', 'repo.reactivate', 'storage.remove']);
    expect(storage.remove).toHaveBeenCalledWith('snapshot-key');
    expect(result.company.status).toBe('active');
    const entry = repo.reactivate.mock.calls[0][2]({ snapshotKey: 'snapshot-key' }) as AuditEntry;
    expect(entry).toMatchObject({ tenantId: null, action: 'company.reactivate', result: 'success', beforeState: expect.objectContaining({ status: 'deactivated' }) });
  });

  it('si la reactivación falla en la base, la copia NO se borra (sigue siendo la red de seguridad)', async () => {
    repo.findById.mockResolvedValue(detail('deactivated'));
    repo.reactivate.mockRejectedValueOnce(new DomainError('COMPANY_ARCHIVE_EXPIRED'));
    expect((await codeOf(build().execute(principal, ID, input, meta)))?.code).toBe('COMPANY_ARCHIVE_EXPIRED');
    expect(storage.remove).not.toHaveBeenCalled();
  });

  it('plazo vencido: COMPANY_ARCHIVE_EXPIRED sin pedir el código', async () => {
    repo.findById.mockResolvedValue(detail('deactivated', new Date(Date.now() - 1000)));
    expect((await codeOf(build().execute(principal, ID, input, meta)))?.code).toBe('COMPANY_ARCHIVE_EXPIRED');
    expect(stepUp.assert).not.toHaveBeenCalled();
    expect(repo.reactivate).not.toHaveBeenCalled();
  });

  it('no archivada: COMPANY_NOT_DEACTIVATED sin pedir el código', async () => {
    repo.findById.mockResolvedValue(detail('active'));
    expect((await codeOf(build().execute(principal, ID, input, meta)))?.code).toBe('COMPANY_NOT_DEACTIVATED');
    expect(stepUp.assert).not.toHaveBeenCalled();
  });

  it('sin copia registrada no intenta borrar nada', async () => {
    repo.findById.mockResolvedValueOnce(detail('deactivated')).mockResolvedValueOnce(detail('active'));
    repo.reactivate.mockResolvedValueOnce(null);
    await build().execute(principal, ID, input, meta);
    expect(storage.remove).not.toHaveBeenCalled();
  });
});

describe('PurgeExpiredCompaniesUseCase', () => {
  const build = () => new PurgeExpiredCompaniesUseCase(asRepo(), asStorage());
  const due = (id: string) => ({ id, name: `Empresa ${id}`, archiveUntil: new Date(Date.now() - 1000), reasonCode: 'non_payment', snapshotKey: null });

  it('entrega al repositorio el borrado de archivos (para correrlo con el candado tomado) y el rastro mínimo', async () => {
    repo.listArchived.mockResolvedValue([due('a')]);
    repo.purge.mockImplementation(async (_scope, _id, cleanFiles, audit) => {
      await cleanFiles();
      calls.push('db.purge');
      const entry = audit({ name: 'Empresa a' }) as AuditEntry;
      expect(entry).toMatchObject({ tenantId: null, userId: null, action: 'company.purge', userAgent: 'system' });
      expect(entry.afterState).toMatchObject({ company_name: 'Empresa a', purged_by: 'system' });
      expect(JSON.stringify(entry.afterState)).not.toContain('company_id');
      return 'Empresa a';
    });
    const summary = await build().execute();
    expect(storage.removePrefix).toHaveBeenCalledWith('a/');
    expect(calls).toEqual(['storage.removePrefix', 'db.purge']);
    expect(summary).toEqual({ purged: ['a'], skipped: [], failed: [] });
  });

  it('no borra los archivos por su cuenta: sin el candado del repositorio no se toca el bucket', async () => {
    repo.listArchived.mockResolvedValue([due('a')]);
    repo.purge.mockResolvedValue(null);
    const summary = await build().execute();
    expect(storage.removePrefix).not.toHaveBeenCalled();
    expect(summary).toEqual({ purged: [], skipped: ['a'], failed: [] });
  });

  it('una que falla no frena a las demás y queda en `failed` para reintentarse', async () => {
    repo.listArchived.mockResolvedValue([due('a'), due('b'), due('c')]);
    repo.purge.mockResolvedValueOnce('A').mockRejectedValueOnce(new Error('bucket caído')).mockResolvedValueOnce(null);
    const summary = await build().execute();
    expect(summary).toEqual({ purged: ['a'], skipped: ['c'], failed: [{ id: 'b', error: 'bucket caído' }] });
  });

  it('solo pide las vencidas a la fecha dada', async () => {
    repo.listArchived.mockResolvedValue([]);
    const now = new Date('2026-12-01T00:00:00Z');
    await build().execute(now);
    expect(repo.listArchived).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin_monkey' }), now);
  });
});
