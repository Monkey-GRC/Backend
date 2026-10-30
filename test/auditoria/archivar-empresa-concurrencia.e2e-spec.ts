import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DomainError } from '../../src/common/errors/domain-error';
import { FileStorage } from '../../src/common/storage/file-storage';
import { PurgeExpiredCompaniesUseCase } from '../../src/features/companies/application/use-cases/purge-expired-companies.use-case';
import { CompanyRepository } from '../../src/features/companies/domain/repositories/company.repository';
import { bootApp, owner, PASSWORD, RUN } from '../support/app';
import { claveEnviadaA } from '../support/correo-en-memoria';
import { connect } from '../support/db';
import { dosEmpresas } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// D97 · Lo que pasa cuando dos cosas ocurren a la vez y cuando algo falla a la mitad (SEG-68). `archivar-empresa.e2e-spec.ts` prueba el camino feliz; aquí se
// prueban las condiciones del UPDATE (carreras entre archivar y reactivar), el candado por empresa de la purga (varias réplicas), el canje de claves de una empresa
// archivada y el rastro de los intentos rechazados.
let app: INestApplication;
let monkey: Awaited<ReturnType<typeof dosEmpresas>>['monkey'];
let scope: { companyId: string; userId: string; role: 'admin_monkey' };
const storage = new StorageEnMemoria();
let n = 0;

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  ({ monkey } = await dosEmpresas(app));
  const [admin] = await owner<{ id: string; company_id: string }>(`select id, company_id from platform.users where email = $1`, [`admin-monkey-${RUN}@aislamiento.test`]);
  scope = { companyId: admin.company_id, userId: admin.id, role: 'admin_monkey' };
});
afterAll(async () => {
  // Nada vencido queda atrás: la purga de `archivar-empresa.e2e-spec.ts` espera encontrar solo sus propias empresas.
  await app.get(PurgeExpiredCompaniesUseCase).execute();
  await app?.close();
});

type Nueva = { id: string; name: string; email: string; code: string };
async function nueva(): Promise<Nueva> {
  const name = `Concurrencia ${RUN} ${++n}`;
  const email = `concurrencia-${RUN}-${n}@aislamiento.test`;
  const res = await monkey.post('/v1/companies').send({ name, requires_dedicated_database: false, admin_email: email, framework_codes: ['soc2'] });
  expect(res.status).toBe(201);
  const [{ id }] = await owner<{ id: string }>('select id from platform.companies where name = $1', [name]);
  return { id, name, email, code: claveEnviadaA(email) };
}

const archive = (c: Nueva, over: Record<string, unknown> = {}) =>
  monkey.post(`/v1/companies/${c.id}/deactivation`).send({ confirm_name: c.name, reason_code: 'non_payment', reason: 'Dos facturas vencidas.', ...over });
const reactivate = (c: Nueva) => monkey.post(`/v1/companies/${c.id}/reactivation`).send({ reason: 'Pagó la deuda.' });
const statusOf = async (c: Nueva) => (await owner<{ status: string }>('select status from platform.companies where id = $1', [c.id]))[0]?.status;
const auditCount = async (action: string, companyId: string, result: string) =>
  (await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where action = $1 and result = $2 and after_state->>'company_id' = $3`, [action, result, companyId]))[0].n;
const snapshots = (c: Nueva) => [...storage.objects.keys()].filter((k) => k.startsWith(`${c.id}/archive/`));
const expire = (c: Nueva) => owner(`update platform.companies set archive_until = now() - interval '1 minute' where id = $1`, [c.id]);
const codes = async (...ps: Array<Promise<{ status: number; body: { error?: { code: string } } }>>) => (await Promise.all(ps)).map((r) => (r.status === 200 ? 'ok' : r.body.error?.code)).sort();

describe('dos archivados a la vez', () => {
  it('solo uno cambia la empresa: el otro recibe 409 y no se lleva la copia del que ganó', async () => {
    const c = await nueva();
    expect(await codes(archive(c), archive(c))).toEqual(['COMPANY_ALREADY_DEACTIVATED', 'ok']);
    expect(await statusOf(c)).toBe('deactivated');
    // Un solo éxito en la auditoría y una sola copia, que es la que la empresa tiene registrada.
    expect(await auditCount('company.deactivate', c.id, 'success')).toBe(1);
    const [row] = await owner<{ archive_snapshot_key: string }>('select archive_snapshot_key from platform.companies where id = $1', [c.id]);
    expect(snapshots(c)).toEqual([row.archive_snapshot_key]);
  });

  it('archivar una ya archivada deja el rastro del intento rechazado y no cambia nada', async () => {
    const c = await nueva();
    expect((await archive(c)).status).toBe(200);
    const [antes] = await owner<{ archive_until: Date; archive_snapshot_key: string }>('select archive_until, archive_snapshot_key from platform.companies where id = $1', [c.id]);
    const res = await archive(c, { retention_days: 365 });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('COMPANY_ALREADY_DEACTIVATED');
    expect(await auditCount('company.deactivate', c.id, 'error')).toBe(1);
    const [despues] = await owner<{ archive_until: Date; archive_snapshot_key: string }>('select archive_until, archive_snapshot_key from platform.companies where id = $1', [c.id]);
    expect(despues).toEqual(antes);
    expect(snapshots(c)).toHaveLength(1);
  });

  it('en el repositorio, el UPDATE condicionado rechaza archivar una ya archivada y no deja rastro de éxito', async () => {
    const c = await nueva();
    expect((await archive(c)).status).toBe(200);
    const repo = app.get(CompanyRepository);
    const antes = await auditCount('company.deactivate', c.id, 'success');
    const intento = repo.archive(
      scope,
      c.id,
      { reasonCode: 'other', reason: 'Otra vez', archiveUntil: new Date(Date.now() + 86_400_000), snapshotKey: 'no-debe-guardarse', at: new Date(), by: scope.userId },
      () => ({ tenantId: null, userId: scope.userId, action: 'company.deactivate', resource: 'company', result: 'success', ipAddress: '', userAgent: '', afterState: { company_id: c.id } }),
    );
    await expect(intento).rejects.toMatchObject({ code: 'COMPANY_ALREADY_DEACTIVATED' });
    expect(await auditCount('company.deactivate', c.id, 'success')).toBe(antes);
    const [row] = await owner<{ archive_snapshot_key: string }>('select archive_snapshot_key from platform.companies where id = $1', [c.id]);
    expect(row.archive_snapshot_key).not.toBe('no-debe-guardarse');
  });
});

describe('reactivar', () => {
  it('dos reactivaciones a la vez: una vuelve a activa, la otra recibe 409 y hay un solo rastro', async () => {
    const c = await nueva();
    expect((await archive(c)).status).toBe(200);
    expect(await codes(reactivate(c), reactivate(c))).toEqual(['COMPANY_NOT_DEACTIVATED', 'ok']);
    expect(await statusOf(c)).toBe('active');
    expect(await auditCount('company.reactivate', c.id, 'success')).toBe(1);
    expect(snapshots(c)).toHaveLength(0);
  });

  it('con el plazo vencido responde 409 COMPANY_ARCHIVE_EXPIRED y la empresa sigue archivada con su copia', async () => {
    const c = await nueva();
    expect((await archive(c)).status).toBe(200);
    await expire(c);
    const res = await reactivate(c);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('COMPANY_ARCHIVE_EXPIRED');
    expect(await statusOf(c)).toBe('deactivated');
    expect(snapshots(c)).toHaveLength(1);
    expect(await auditCount('company.reactivate', c.id, 'success')).toBe(0);
  });

  it('en el repositorio, si el plazo vence después de la verificación del caso de uso, el UPDATE lo rechaza y no escribe el rastro', async () => {
    const c = await nueva();
    expect((await archive(c)).status).toBe(200);
    await expire(c);
    const repo = app.get(CompanyRepository);
    const intento = repo.reactivate(scope, c.id, () => ({ tenantId: null, userId: scope.userId, action: 'company.reactivate', resource: 'company', result: 'success', ipAddress: '', userAgent: '', afterState: { company_id: c.id } }));
    await expect(intento).rejects.toBeInstanceOf(DomainError);
    await expect(intento).rejects.toMatchObject({ code: 'COMPANY_ARCHIVE_EXPIRED' });
    expect(await statusOf(c)).toBe('deactivated');
    expect(await auditCount('company.reactivate', c.id, 'success')).toBe(0);
  });

  it('en el repositorio, reactivar una empresa activa se rechaza con COMPANY_NOT_DEACTIVATED', async () => {
    const c = await nueva();
    const repo = app.get(CompanyRepository);
    await expect(repo.reactivate(scope, c.id, () => ({ tenantId: null, userId: scope.userId, action: 'company.reactivate', resource: 'company', result: 'success', ipAddress: '', userAgent: '', afterState: {} }))).rejects.toMatchObject({
      code: 'COMPANY_NOT_DEACTIVATED',
    });
  });
});

describe('el borrado definitivo con varias réplicas (candado por empresa)', () => {
  const archivadaVencida = async () => {
    const c = await nueva();
    expect((await archive(c)).status).toBe(200);
    await expire(c);
    storage.objects.set(`${c.id}/services/x/evidence/y/z.pdf`, { body: Buffer.from('%PDF'), contentType: 'application/pdf' });
    return c;
  };
  const existe = async (c: Nueva) => (await owner('select 1 from platform.companies where id = $1', [c.id])).length === 1;
  const archivosDe = (c: Nueva) => [...storage.objects.keys()].filter((k) => k.startsWith(`${c.id}/`));
  const llavePurga = (c: Nueva) => `company_purge:${c.id}`;

  it('si otra réplica tiene el candado de la empresa, esta no toca ni sus archivos ni su base; al soltarse, se borra', async () => {
    const c = await archivadaVencida();
    const otraReplica = await connect();
    try {
      // Una conexión aparte toma el candado de esa empresa, como lo haría otra réplica en medio de su propia purga.
      await otraReplica.query('select pg_advisory_lock(hashtextextended($1, 0))', [llavePurga(c)]);
      const resumen = await app.get(PurgeExpiredCompaniesUseCase).execute();
      expect(resumen.skipped).toContain(c.id);
      expect(resumen.purged).not.toContain(c.id);
      expect(resumen.failed).toEqual([]);
      expect(await existe(c)).toBe(true);
      expect(archivosDe(c).length).toBeGreaterThan(0);
      expect(await statusOf(c)).toBe('deactivated');
    } finally {
      await otraReplica.query('select pg_advisory_unlock_all()');
      await otraReplica.end();
    }
    const resumen = await app.get(PurgeExpiredCompaniesUseCase).execute();
    expect(resumen.purged).toContain(c.id);
    expect(await existe(c)).toBe(false);
    expect(archivosDe(c)).toEqual([]);
  });

  it('dos réplicas a la vez: la empresa se borra una sola vez, sus archivos se borran una sola vez y queda un solo rastro', async () => {
    const c = await archivadaVencida();
    const espia = jest.spyOn(storage, 'removePrefix');
    try {
      const [r1, r2] = await Promise.all([app.get(PurgeExpiredCompaniesUseCase).execute(), app.get(PurgeExpiredCompaniesUseCase).execute()]);
      expect([...r1.purged, ...r2.purged].filter((id) => id === c.id)).toHaveLength(1);
      expect([...r1.failed, ...r2.failed]).toEqual([]);
      expect(espia.mock.calls.filter(([prefijo]) => prefijo === `${c.id}/`)).toHaveLength(1);
    } finally {
      espia.mockRestore();
    }
    expect(await existe(c)).toBe(false);
    expect(await owner(`select 1 from platform.company_purge_log where company_name = $1`, [c.name])).toHaveLength(1);
    expect(await owner(`select 1 from audit.audit_logs where action = 'company.purge' and after_state->>'company_name' = $1`, [c.name])).toHaveLength(1);
  });

  it('si el bucket falla, la empresa sigue archivada, el candado se suelta y la pasada siguiente la borra', async () => {
    const c = await archivadaVencida();
    const espia = jest.spyOn(storage, 'removePrefix').mockRejectedValueOnce(new Error('bucket caído'));
    try {
      const resumen = await app.get(PurgeExpiredCompaniesUseCase).execute();
      expect(resumen.failed).toEqual(expect.arrayContaining([{ id: c.id, error: 'bucket caído' }]));
    } finally {
      espia.mockRestore();
    }
    expect(await statusOf(c)).toBe('deactivated');
    // El candado dura lo que la transacción: tras el fallo nadie lo tiene.
    const sonda = await connect();
    try {
      const [{ ok }] = (await sonda.query('select pg_try_advisory_lock(hashtextextended($1, 0)) as ok', [llavePurga(c)])).rows;
      expect(ok).toBe(true);
      await sonda.query('select pg_advisory_unlock_all()');
    } finally {
      await sonda.end();
    }
    const resumen = await app.get(PurgeExpiredCompaniesUseCase).execute();
    expect(resumen.purged).toContain(c.id);
    expect(await existe(c)).toBe(false);
  });

  it('una empresa que ya no existe (la borró otra réplica entre listar y borrar) se salta sin error', async () => {
    const c = await archivadaVencida();
    const repo = app.get(CompanyRepository);
    const sistema = { companyId: '', role: 'admin_monkey' as const };
    const limpiar = jest.fn(async () => undefined);
    const audit = () => ({ tenantId: null, userId: null, action: 'company.purge', resource: 'company', result: 'success' as const, ipAddress: '', userAgent: 'system' });
    expect(await repo.purge(sistema, c.id, limpiar, audit)).toBe(c.name);
    expect(await repo.purge(sistema, c.id, limpiar, audit)).toBeNull();
    expect(limpiar).toHaveBeenCalledTimes(1);
  });
});

describe('una empresa archivada no deja canjear su clave de acceso', () => {
  it('ni consultarla ni canjearla; no se gasta, y al reactivar sirve', async () => {
    const c = await nueva();
    const http = () => request(app.getHttpServer());
    expect((await http().post('/v1/auth/redeem/lookup').send({ code: c.code })).status).toBe(200);

    expect((await archive(c)).status).toBe(200);
    const lookup = await http().post('/v1/auth/redeem/lookup').send({ code: c.code });
    expect(lookup.status).toBeGreaterThanOrEqual(400);
    expect(lookup.body.error.code).toBe('ACCESS_KEY_INVALID');
    const redeem = await http().post('/v1/auth/redeem').send({ code: c.code, email: c.email, password: PASSWORD });
    expect(redeem.status).toBeGreaterThanOrEqual(400);
    // Responde como clave inválida: no revela que la empresa está archivada.
    expect(redeem.body.error.code).toBe('ACCESS_KEY_INVALID');
    expect(await owner('select 1 from platform.users where company_id = $1', [c.id])).toHaveLength(0);

    expect((await reactivate(c)).status).toBe(200);
    expect((await http().post('/v1/auth/redeem').send({ code: c.code, email: c.email, password: PASSWORD })).status).toBe(201);
  });
});
