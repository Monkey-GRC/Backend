import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootApp, owner, PASSWORD, RUN } from '../support/app';
import { claveEnviadaA, correo } from '../support/correo-en-memoria';
import { dosEmpresas } from '../support/escenario';

// D99 · La clave de acceso solo sale por correo (SEG-71): no viaja en la respuesta, no entra al rastro, reenviar anula la anterior y un fallo del
// correo no tumba el registro.
let app: INestApplication;
let monkey: Awaited<ReturnType<typeof dosEmpresas>>['monkey'];
let a: Awaited<ReturnType<typeof dosEmpresas>>['a'];
let n = 0;

beforeAll(async () => {
  app = await bootApp();
  ({ monkey, a } = await dosEmpresas(app));
});
afterAll(async () => app?.close());

const registrar = async (over: Record<string, unknown> = {}) => {
  const email = `clave-correo-${RUN}-${++n}@aislamiento.test`;
  const res = await monkey.post('/v1/companies').send({ name: `Clave correo ${RUN} ${n}`, requires_dedicated_database: false, admin_email: email, framework_codes: ['soc2'], ...over });
  return { res, email, id: res.body?.data?.id as string };
};
const canjear = (code: string, email: string) => request(app.getHttpServer()).post('/v1/auth/redeem').send({ code, email, password: PASSWORD });
const regenerar = (id: string) => monkey.post(`/v1/companies/${id}/access-key/regenerate`);

describe('registrar una empresa', () => {
  it('la clave llega por correo al admin_email y NO viaja en la respuesta', async () => {
    const { res, email } = await registrar();
    expect(res.status).toBe(201);
    expect(res.body.data.access_key.delivery_status).toBe('sent');
    expect(res.body.data.access_key.code).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toMatch(/MNK-/);
    const clave = claveEnviadaA(email);
    expect(correo.paraEl(email)).toHaveLength(1);
    expect((await canjear(clave, email)).status).toBe(201);
  });

  it('ni el rastro de auditoría ni la base guardan la clave en claro', async () => {
    const { email, id } = await registrar();
    const clave = claveEnviadaA(email);
    const rastro = await owner<{ s: string }>(`select (coalesce(before_state::text,'') || coalesce(after_state::text,'')) s from audit.audit_logs where after_state->>'company_id' = $1`, [id]);
    expect(rastro.length).toBeGreaterThan(0);
    for (const r of rastro) expect(r.s).not.toContain(clave);
    const filas = await owner<{ code_hash: string }>('select code_hash from platform.access_keys where company_id = $1', [id]);
    expect(filas[0].code_hash).not.toContain(clave.replace(/-/g, ''));
  });

  it('deja `access_key.email` con éxito', async () => {
    const { id } = await registrar();
    const [row] = await owner<{ result: string }>(`select result from audit.audit_logs where action = 'access_key.email' and after_state->>'company_id' = $1`, [id]);
    expect(row.result).toBe('success');
  });

  it('si el correo falla, la empresa se crea igual y la respuesta dice `failed`', async () => {
    correo.falla = true;
    const { res, email, id } = await registrar();
    correo.falla = false;
    expect(res.status).toBe(201);
    expect(res.body.data.access_key.delivery_status).toBe('failed');
    expect(res.body.data.access_key.status).toBe('pending');
    expect(correo.paraEl(email)).toHaveLength(0);
    expect((await owner('select 1 from platform.companies where id = $1', [id])).length).toBe(1);
    const [row] = await owner<{ result: string }>(`select result from audit.audit_logs where action = 'access_key.email' and after_state->>'company_id' = $1`, [id]);
    expect(row.result).toBe('error');
  });
});

describe('reenviar la clave', () => {
  it('anula la anterior, emite una nueva por correo y la nueva sirve', async () => {
    const { email, id } = await registrar();
    const vieja = claveEnviadaA(email);
    const res = await regenerar(id);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.delivery_status).toBe('sent');
    expect(JSON.stringify(res.body)).not.toMatch(/MNK-/);
    const nueva = claveEnviadaA(email);
    expect(nueva).not.toBe(vieja);
    expect(correo.paraEl(email)).toHaveLength(2);

    const rechazo = await canjear(vieja, email);
    expect(rechazo.status).toBeGreaterThanOrEqual(400);
    expect(rechazo.body.error.code).toBe('ACCESS_KEY_INVALID');
    expect((await owner<{ status: string }>('select status from platform.access_keys where company_id = $1 order by expires_at', [id])).map((k) => k.status)).toEqual(['revoked', 'pending']);
    expect((await canjear(nueva, email)).status).toBe(201);
  });

  it('deja `access_key.regenerate` con la cuenta de claves anuladas y sin la clave', async () => {
    const { email, id } = await registrar();
    await regenerar(id);
    const [row] = await owner<{ s: string; revoked: string }>(`select after_state::text s, after_state->>'revoked_keys' revoked from audit.audit_logs where action = 'access_key.regenerate' and after_state->>'company_id' = $1`, [id]);
    expect(row.revoked).toBe('1');
    expect(row.s).not.toContain(claveEnviadaA(email));
  });

  it('si el correo falla, la clave nueva existe y se puede reenviar otra vez', async () => {
    const { email, id } = await registrar();
    correo.falla = true;
    const fallida = await regenerar(id);
    correo.falla = false;
    expect(fallida.status).toBe(200);
    expect(fallida.body.data.delivery_status).toBe('failed');
    expect((await regenerar(id)).body.data.delivery_status).toBe('sent');
    expect((await canjear(claveEnviadaA(email), email)).status).toBe(201);
  });

  it('una empresa que ya canjeó su clave responde 409 ACCESS_KEY_NOT_PENDING y no manda nada', async () => {
    const { email, id } = await registrar();
    expect((await canjear(claveEnviadaA(email), email)).status).toBe(201);
    const antes = correo.enviados.length;
    const res = await regenerar(id);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ACCESS_KEY_NOT_PENDING');
    expect(correo.enviados.length).toBe(antes);
  });

  it('una clave vencida se puede reenviar', async () => {
    const { email, id } = await registrar();
    await owner(`update platform.access_keys set expires_at = now() - interval '1 hour' where company_id = $1`, [id]);
    expect((await regenerar(id)).status).toBe(200);
    expect((await canjear(claveEnviadaA(email), email)).status).toBe(201);
  });

  it('una empresa archivada responde 409 y una inexistente 404', async () => {
    const { id } = await registrar();
    await owner(`update platform.companies set status = 'deactivated', deactivated_at = now(), archive_until = now() + interval '30 days' where id = $1`, [id]);
    expect((await regenerar(id)).body.error.code).toBe('COMPANY_ALREADY_DEACTIVATED');
    expect((await regenerar('00000000-0000-4000-8000-000000000000')).status).toBe(404);
  });

  it('solo admin_monkey: el admin de una empresa recibe 403', async () => {
    const { id } = await registrar();
    expect((await a.agent.post(`/v1/companies/${id}/access-key/regenerate`)).status).toBe(403);
  });
});
