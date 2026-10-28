import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CredentialCipher } from '../../src/common/security/credential-cipher';
import { FileStorage } from '../../src/common/storage/file-storage';
import { PurgeExpiredCompaniesUseCase } from '../../src/features/companies/application/use-cases/purge-expired-companies.use-case';
import { generateTotpSecret, totpAt } from '../../src/features/auth/domain/totp';
import { bootApp, owner, PASSWORD, RUN } from '../support/app';
import { connect } from '../support/db';
import { dosEmpresas, Tenant } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// D95 · Archivar una empresa y borrarla definitivamente (SEG-64): corta accesos y motores, se puede deshacer dentro del plazo, y al vencer se borra
// TODO lo suyo —incluida la auditoría inmutable— sin tocar a la otra empresa, dejando solo el rastro mínimo.
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Awaited<ReturnType<typeof dosEmpresas>>['monkey'];
const storage = new StorageEnMemoria();

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  ({ a, b, monkey } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});

const archive = (t: Tenant, over: Record<string, unknown> = {}) =>
  monkey.post(`/v1/companies/${t.companyId}/deactivation`).send({ confirm_name: t.companyName, reason_code: 'non_payment', reason: 'Dos facturas vencidas.', ...over });
const status = async (t: Tenant) => (await owner<{ status: string }>('select status from platform.companies where id = $1', [t.companyId]))[0]?.status;

/** Toda tabla de tenant/platform/audit con `tenant_id` o `company_id`, y cuántas filas tiene la empresa en cada una. */
async function filasDe(companyId: string): Promise<Record<string, number>> {
  const tablas = await owner<{ s: string; t: string; c: string }>(
    `select n.nspname s, c.relname t, a.attname c from pg_class c join pg_namespace n on n.oid = c.relnamespace join pg_attribute a on a.attrelid = c.oid
      where c.relkind = 'r' and n.nspname in ('platform','tenant','audit') and a.attname in ('tenant_id','company_id') and not a.attisdropped and not (n.nspname = 'platform' and c.relname in ('companies', 'company_purge_log'))`,
  );
  const out: Record<string, number> = {};
  for (const { s, t, c } of tablas) out[`${s}.${t}`] = (await owner<{ n: number }>(`select count(*)::int n from ${s}.${t} where ${c} = $1`, [companyId]))[0].n;
  return out;
}

describe('cobertura del borrado definitivo', () => {
  it('toda tabla de datos de una empresa tiene `tenant_id` o `company_id`: una nueva sin él se quedaría sin borrar', async () => {
    const sinColumna = await owner<{ tabla: string }>(
      `select n.nspname || '.' || c.relname tabla from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where c.relkind = 'r' and n.nspname in ('platform','tenant','audit')
          and not exists (select 1 from pg_attribute a where a.attrelid = c.oid and a.attname in ('tenant_id','company_id') and not a.attisdropped)`,
    );
    // `companies` se borra al final y `company_purge_log` es el rastro que sobrevive.
    expect(sinColumna.map((r) => r.tabla).sort()).toEqual(['platform.companies']);
  });
});

describe('archivar', () => {
  it('pide la razón social exacta, un motivo válido y no deja nada a medias', async () => {
    expect((await archive(a, { confirm_name: a.companyName.toLowerCase() })).status).toBe(422);
    expect((await archive(a, { confirm_name: a.companyName.toLowerCase() })).body.error.code).toBe('CONFIRMATION_MISMATCH');
    expect((await archive(a, { reason: 'x' })).status).toBe(422);
    expect((await archive(a, { retention_days: 3 })).status).toBe(422);
    expect(await status(a)).toBe('active');
  });

  it('solo admin_monkey: la propia empresa no puede archivarse', async () => {
    const res = await a.agent.post(`/v1/companies/${a.companyId}/deactivation`).send({ confirm_name: a.companyName, reason_code: 'other', reason: 'Probando.' });
    expect(res.status).toBe(403);
    expect(await status(a)).toBe('active');
  });

  it('con el segundo factor activo exige el código de quien archiva', async () => {
    const [me] = await owner<{ id: string }>(`select u.id from platform.users u where u.role = 'admin_monkey' and u.email like $1`, [`%${RUN}%`]);
    const secret = generateTotpSecret();
    const cipher = app.get(CredentialCipher);
    await owner(`update platform.users set is_mfa_enabled = true, mfa_secret_encrypted = $2 where id = $1`, [me.id, cipher.encrypt({ secret })]);
    try {
      const sin = await archive(b);
      expect(sin.status).toBe(401);
      expect(sin.body.error.code).toBe('MFA_CODE_INVALID');
      expect(await status(b)).toBe('active');
    } finally {
      await owner(`update platform.users set is_mfa_enabled = false, mfa_secret_encrypted = null, mfa_last_used_step = null where id = $1`, [me.id]);
    }
    expect(totpAt(secret, new Date())).toMatch(/^\d{6}$/);
  });
});

describe('una empresa archivada', () => {
  let antes: Record<string, number>;
  let detail: request.Response;

  beforeAll(async () => {
    antes = await filasDe(a.companyId);
    detail = await archive(a, { retention_days: 30 });
  });

  it('queda `deactivated` con su plazo, y deja copia cifrada y rastro (sin el motivo en la auditoría)', async () => {
    expect(detail.status).toBe(200);
    expect(detail.body.data).toMatchObject({ status: 'deactivated', deactivation_reason_code: 'non_payment', deactivation_reason: 'Dos facturas vencidas.' });
    const dias = (new Date(detail.body.data.archive_until).getTime() - Date.now()) / 86_400_000;
    expect(dias).toBeGreaterThan(29);
    expect(dias).toBeLessThan(31);
    const copias = [...storage.objects.keys()].filter((k) => k.startsWith(`${a.companyId}/archive/`));
    expect(copias).toHaveLength(1);
    const cifrada = storage.objects.get(copias[0])!.body.toString('utf8');
    expect(cifrada.startsWith('v1.')).toBe(true);
    expect(cifrada).not.toContain(a.companyName);
    const [rastro] = await owner<{ after_state: Record<string, unknown> }>(
      `select after_state from audit.audit_logs where tenant_id is null and action = 'company.deactivate' and after_state->>'company_id' = $1`,
      [a.companyId],
    );
    expect(rastro.after_state).toMatchObject({ name: a.companyName, reason_code: 'non_payment' });
    expect(JSON.stringify(rastro.after_state)).not.toContain('facturas');
  });

  it('no entra: ni con la sesión que tenía ni con contraseña nueva', async () => {
    expect((await a.agent.get('/v1/auth/me')).status).toBe(401);
    const login = await request(app.getHttpServer()).post('/v1/auth/login').send({ email: a.email, password: PASSWORD });
    expect(login.status).toBe(403);
    expect(login.body.error.code).toBe('ACCOUNT_INACTIVE');
    expect((await a.agent.post('/v1/auth/refresh').send()).status).toBe(401);
  });

  it('no se evalúa: lo que estaba en cola se cancela y el trabajador no reclama nada de ella', async () => {
    const abiertas = await owner<{ n: number }>(`select count(*)::int n from tenant.executions where tenant_id = $1 and status in ('queued','running')`, [a.companyId]);
    expect(abiertas[0].n).toBe(0);
    await owner(
      `insert into tenant.executions (id, tenant_id, asset_id, queued_at, status, origin, kind) values (gen_random_uuid(), $1, $2, now(), 'queued', 'manual', 'assessment')`,
      [a.companyId, a.assetId],
    );
    const reclamadas = await owner<{ out_tenant_id: string }>(`select * from tenant.claim_next_execution()`);
    expect(reclamadas.map((r) => r.out_tenant_id)).not.toContain(a.companyId);
  });

  it('conserva todos sus datos hasta el borrado definitivo, y la otra empresa ni se entera', async () => {
    const ahora = await filasDe(a.companyId);
    for (const [tabla, n] of Object.entries(antes)) if (!tabla.endsWith('sessions') && !tabla.endsWith('mfa_challenges') && !tabla.endsWith('executions') && !tabla.endsWith('audit_logs')) expect(ahora[tabla]).toBe(n);
    expect(await status(b)).toBe('active');
    expect((await b.agent.get('/v1/auth/me')).status).toBe(200);
  });

  it('sale del listado por defecto y aparece con el filtro y en las pendientes de borrar', async () => {
    const lista = (await monkey.get('/v1/companies?page_size=100').expect(200)).body.data.items.map((c: { id: string }) => c.id);
    expect(lista).not.toContain(a.companyId);
    expect(lista).toContain(b.companyId);
    const filtrada = (await monkey.get('/v1/companies?status=deactivated&page_size=100').expect(200)).body.data.items.map((c: { id: string }) => c.id);
    expect(filtrada).toContain(a.companyId);
    const pendientes = (await monkey.get('/v1/companies/pending-purge').expect(200)).body.data.items;
    expect(pendientes.find((c: { id: string }) => c.id === a.companyId)).toMatchObject({ name: a.companyName, days_left: expect.any(Number) });
  });

  it('no se puede archivar dos veces', async () => {
    const otra = await archive(a);
    expect(otra.status).toBe(409);
    expect(otra.body.error.code).toBe('COMPANY_ALREADY_DEACTIVATED');
  });

  it('la app no puede borrarla antes de tiempo: la base lo impide', async () => {
    const resumen = await app.get(PurgeExpiredCompaniesUseCase).execute();
    expect(resumen.purged).not.toContain(a.companyId);
    expect(await status(a)).toBe('deactivated');
    const [r] = await owner<{ n: number }>(`select count(*)::int n from tenant.services where tenant_id = $1`, [a.companyId]);
    expect(r.n).toBeGreaterThan(0);
  });
});

describe('reactivar y volver a archivar', () => {
  it('dentro del plazo vuelve a `active`, el plazo desaparece y la copia se borra', async () => {
    const res = await monkey.post(`/v1/companies/${a.companyId}/reactivation`).send({ reason: 'Pagó la deuda.' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'active', archive_until: null, deactivated_at: null, deactivation_reason: null });
    expect([...storage.objects.keys()].some((k) => k.startsWith(`${a.companyId}/archive/`))).toBe(false);
    const login = await request(app.getHttpServer()).post('/v1/auth/login').send({ email: a.email, password: PASSWORD });
    expect(login.status).toBe(200);
  });

  it('reactivar una que no está archivada responde 409', async () => {
    const res = await monkey.post(`/v1/companies/${a.companyId}/reactivation`).send({ reason: 'Otra vez.' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('COMPANY_NOT_DEACTIVATED');
  });

  it('al archivar otra vez se elige un plazo nuevo y se cumple completo', async () => {
    const res = await archive(a, { retention_days: 90 });
    expect(res.status).toBe(200);
    const dias = (new Date(res.body.data.archive_until).getTime() - Date.now()) / 86_400_000;
    expect(dias).toBeGreaterThan(89);
  });
});

describe('borrado definitivo', () => {
  let antesB: Record<string, number>;
  let antesAuditoriaB: number;
  let resumen: Awaited<ReturnType<PurgeExpiredCompaniesUseCase['execute']>>;

  beforeAll(async () => {
    antesB = await filasDe(b.companyId);
    [{ n: antesAuditoriaB }] = await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1`, [b.companyId]);
    // El plazo vence (como dueño: la app no puede adelantarlo).
    await owner(`update platform.companies set archive_until = now() - interval '1 minute' where id = $1`, [a.companyId]);
    storage.objects.set(`${a.companyId}/services/x/evidence/y/z.pdf`, { body: Buffer.from('%PDF'), contentType: 'application/pdf' });
    storage.objects.set(`${b.companyId}/services/x/evidence/y/z.pdf`, { body: Buffer.from('%PDF'), contentType: 'application/pdf' });
    resumen = await app.get(PurgeExpiredCompaniesUseCase).execute();
  });

  it('borra la empresa archivada con el plazo vencido y solo esa', () => {
    expect(resumen.failed).toEqual([]);
    expect(resumen.purged).toEqual([a.companyId]);
  });

  it('no queda ninguna fila suya en ninguna tabla, auditoría inmutable incluida', async () => {
    expect(await owner('select 1 from platform.companies where id = $1', [a.companyId])).toHaveLength(0);
    const quedan = Object.entries(await filasDe(a.companyId)).filter(([, n]) => n > 0);
    expect(quedan).toEqual([]);
    expect(await owner(`select 1 from audit.audit_logs where after_state->>'company_id' = $1`, [a.companyId])).toHaveLength(0);
    expect(await owner(`select 1 from audit.audit_logs where attempted_email = $1`, [a.email])).toHaveLength(0);
  });

  it('borra sus archivos y su copia, y deja los de la otra empresa', () => {
    expect([...storage.objects.keys()].filter((k) => k.startsWith(`${a.companyId}/`))).toEqual([]);
    expect(storage.objects.has(`${b.companyId}/services/x/evidence/y/z.pdf`)).toBe(true);
  });

  it('deja solo el rastro mínimo: nombre, cuándo y quién', async () => {
    const [log] = await owner<{ company_name: string; archived_by: string | null; purged_at: Date }>('select * from platform.company_purge_log where company_id = $1', [a.companyId]);
    expect(log.company_name).toBe(a.companyName);
    expect(log.archived_by).toBeTruthy();
    expect(log.purged_at).toBeInstanceOf(Date);
    const [evento] = await owner<{ after_state: Record<string, unknown> }>(`select after_state from audit.audit_logs where action = 'company.purge' and after_state->>'company_name' = $1`, [a.companyName]);
    expect(evento.after_state).toMatchObject({ purged_by: 'system' });
    expect(evento.after_state['company_id']).toBeUndefined();
  });

  it('la otra empresa queda intacta, con su auditoría inmutable', async () => {
    expect(await filasDe(b.companyId)).toEqual(antesB);
    const [{ n }] = await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1`, [b.companyId]);
    expect(n).toBeGreaterThanOrEqual(antesAuditoriaB);
    expect((await b.agent.get('/v1/auth/me')).status).toBe(200);
  });

  it('una empresa activa no se puede purgar ni borrar su auditoría, ni siquiera como dueño sin la purga en curso', async () => {
    await expect(owner('select platform.purge_company($1)', [b.companyId])).rejects.toThrow(/purge_not_due/);
    await expect(owner('delete from audit.audit_logs where tenant_id = $1', [b.companyId])).rejects.toThrow(/append-only/);
  });

  it('la app (monkey_app) no puede borrar auditoría aunque fije la variable de la purga', async () => {
    const db = await connect();
    try {
      await db.query('begin');
      await db.query(`select set_config('monkey.purging_company', $1, true), set_config('app.tenant_id', $1, true)`, [b.companyId]);
      await db.query('set local role monkey_app');
      await expect(db.query('delete from audit.audit_logs where tenant_id = $1', [b.companyId])).rejects.toThrow(/permission denied|append-only/);
    } finally {
      await db.query('rollback').catch(() => undefined);
      await db.end();
    }
  });
});
