import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { createHmac, randomUUID } from 'node:crypto';
import request from 'supertest';
import { totpAt } from '../../src/features/auth/domain/totp';
import { FileStorage } from '../../src/common/storage/file-storage';
import { StorageEnMemoria } from '../support/storage-en-memoria';
import { Agent, bootApp, owner, PASSWORD, RUN } from '../support/app';
import { correo } from '../support/correo-en-memoria';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-217 · D123, SEG-84 · «Recordar este dispositivo por 30 días»: solo salta el código del segundo factor, nunca la contraseña.
let app: INestApplication;
let a: Tenant;
let monkey: Agent;
let n = 0;

const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const FIREFOX = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1';
// La empresa interna de Monkey de ESTA corrida (otras suites comparten la base del worker).
const monkeyCompany = async () => (await owner<{ company_id: string }>('select company_id from platform.users where email = $1', [`admin-monkey-${RUN}@aislamiento.test`]))[0].company_id;
const http = () => request(app.getHttpServer());
const setCookies = (res: request.Response) => (res.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
const deviceCookie = (res: request.Response) => setCookies(res).find((c) => c.startsWith('mnk_device=')) as string;
const deviceToken = (res: request.Response) => deviceCookie(res).split(';')[0].split('=')[1];

type Persona = { id: string; email: string; secret: string; recovery: string[] };

beforeAll(async () => {
  app = await bootApp({ PLATFORM_APP_URL: 'http://platform.test' }, (builder) => builder.overrideProvider(FileStorage).useValue(new StorageEnMemoria()));
  ({ a, monkey } = await dosEmpresas(app));
  process.env['MFA_REQUIRED'] = 'true';
});
afterAll(async () => {
  process.env['MFA_REQUIRED'] = 'false';
  await app?.close();
});

async function code(email: string, secret: string): Promise<string> {
  await owner('update platform.users set mfa_last_used_step = null where email = $1', [email]);
  return totpAt(secret, new Date());
}

/** Una persona activa con el segundo factor ya configurado (por la API) y su secreto. */
async function persona(role: 'admin_empresa' | 'responsable' | 'auditor' | 'admin_monkey' = 'responsable', configurar = true): Promise<Persona> {
  const id = randomUUID();
  const email = `dev-${role}-${RUN}-${n++}@dispositivos.test`;
  const companyId = role === 'admin_monkey' ? (await monkeyCompany()) : a.companyId;
  await owner(`insert into platform.users (id, company_id, email, password_hash, role, status) values ($1, $2, $3, $4, $5, 'active')`, [id, companyId, email, await bcrypt.hash(PASSWORD, 4), role]);
  const p: Persona = { id, email, secret: '', recovery: [] };
  if (!configurar) return p;
  const agent = request.agent(app.getHttpServer());
  await agent.post('/v1/auth/login').send({ email, password: PASSWORD });
  p.secret = (await agent.post('/v1/auth/mfa/setup').send()).body.data.secret;
  const confirmed = await agent.post('/v1/auth/mfa/setup/confirm').send({ code: totpAt(p.secret, new Date()) });
  expect(confirmed.status).toBe(200);
  p.recovery = confirmed.body.data.recovery_codes;
  return p;
}

const login = (agent: Agent, p: Persona, ua = CHROME) => agent.post('/v1/auth/login').set('User-Agent', ua).send({ email: p.email, password: PASSWORD });

/** Contraseña + código (con o sin «recordar») desde un navegador (agent). */
async function entrar(agent: Agent, p: Persona, remember: boolean, ua = CHROME): Promise<request.Response> {
  const first = await login(agent, p, ua);
  expect(first.body.data.next_step).toBe('mfa_verify');
  return agent.post('/v1/auth/mfa/verify').set('User-Agent', ua).send({ code: await code(p.email, p.secret), remember_device: remember });
}

const devices = (userId: string) => owner<{ id: string; token_hash: string; revoked_at: Date | null; expires_at: Date; last_used_at: Date | null; browser: string | null; os: string | null; ip_address: string }>(`select id, token_hash, revoked_at, expires_at, last_used_at, browser, os, ip_address from platform.trusted_devices where user_id = $1 order by created_at`, [userId]);
const audits = (userId: string, action: string) => owner<{ after_state: Record<string, unknown> }>(`select after_state from audit.audit_logs where user_id = $1 and action = $2 order by created_at`, [userId, action]);
const sembrar = async (p: Persona, over: { created?: string; expires?: string; revoked?: boolean; userId?: string; city?: object | null } = {}): Promise<string> => {
  const id = randomUUID();
  await owner(
    `insert into platform.trusted_devices (id, company_id, user_id, token_hash, browser, os, ip_address, country, city, created_at, expires_at, revoked_at) values ($1, $2, $3, $4, 'Firefox', 'Linux', '10.0.0.1', 'CO', $5, $6::timestamp, $7::timestamp, $8)`,
    [id, a.companyId, over.userId ?? p.id, `h-${id}`, over.city === undefined ? null : JSON.stringify(over.city), over.created ?? new Date().toISOString(), over.expires ?? new Date(Date.now() + 86_400_000).toISOString(), over.revoked ? new Date() : null],
  );
  return id;
};
const vigentes = async (userId: string) => (await devices(userId)).filter((d) => !d.revoked_at).length;

describe('recordar al verificar el código', () => {
  it('con el código de la app: cookie httpOnly, ruta /v1/auth, SameSite=Lax, 30 días, sin Secure; el token no viaja en el cuerpo ni en la auditoría y la base guarda solo su HMAC', async () => {
    const p = await persona();
    const agent = request.agent(app.getHttpServer());
    const res = await entrar(agent, p, true);
    expect(res.status).toBe(200);
    const cookie = deviceCookie(res);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Path=\/v1\/auth(;|$)/);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).not.toMatch(/Secure/i);
    expect(Number(/Max-Age=(\d+)/i.exec(cookie)?.[1])).toBe(30 * 24 * 60 * 60);
    const token = deviceToken(res);
    expect(JSON.stringify(res.body)).not.toContain(token);

    const [d] = await devices(p.id);
    expect(d.token_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(d.token_hash).not.toBe(token);
    expect(d).toMatchObject({ browser: 'Chrome', os: 'Windows' });
    const [span] = await owner<{ days: number; created_now: number }>(`select extract(epoch from expires_at - created_at) / 86400 as days, abs(extract(epoch from (now() at time zone 'utc') - created_at)) as created_now from platform.trusted_devices where id = $1`, [d.id]);
    expect(Number(span.days)).toBe(30);
    expect(Number(span.created_now)).toBeLessThan(60);
    const trusted = await audits(p.id, 'auth.device_trusted');
    expect(trusted).toHaveLength(1);
    expect(JSON.stringify(trusted)).not.toContain(token);
    expect(JSON.stringify(trusted)).not.toContain(d.token_hash);
    const all = await owner<{ s: string }>(`select (after_state::text || coalesce(before_state::text, '')) s from audit.audit_logs where tenant_id = $1`, [a.companyId]);
    expect(all.some((r) => r.s.includes(token) || r.s.includes(d.token_hash))).toBe(false);
  });

  it('sin remember_device (o en false) no se crea nada ni se pone la cookie', async () => {
    const p = await persona();
    const res = await entrar(request.agent(app.getHttpServer()), p, false);
    expect(res.status).toBe(200);
    expect(deviceCookie(res)).toBeUndefined();
    expect(await devices(p.id)).toHaveLength(0);
  });

  it('remember_device que no es boolean: 422', async () => {
    const p = await persona();
    const agent = request.agent(app.getHttpServer());
    await login(agent, p);
    const res = await agent.post('/v1/auth/mfa/verify').send({ code: await code(p.email, p.secret), remember_device: 'si' });
    expect(res.status).toBe(422);
  });

  it('con un código de recuperación también recuerda', async () => {
    const p = await persona();
    const agent = request.agent(app.getHttpServer());
    await login(agent, p);
    const res = await agent.post('/v1/auth/mfa/verify').send({ recovery_code: p.recovery[0], remember_device: true });
    expect(res.status).toBe(200);
    expect(res.body.data.recovery_codes_left).toBe(9);
    expect(deviceCookie(res)).toBeDefined();
    expect(await vigentes(p.id)).toBe(1);
  });

  it('al confirmar la configuración del segundo factor también recuerda', async () => {
    const p = await persona('responsable', false);
    const agent = request.agent(app.getHttpServer());
    await login(agent, p);
    const secret = (await agent.post('/v1/auth/mfa/setup').send()).body.data.secret;
    const res = await agent.post('/v1/auth/mfa/setup/confirm').send({ code: totpAt(secret, new Date()), remember_device: true });
    expect(res.status).toBe(200);
    expect(res.body.data.recovery_codes).toHaveLength(10);
    expect(deviceCookie(res)).toBeDefined();
    expect(await vigentes(p.id)).toBe(1);
    expect(await audits(p.id, 'auth.device_trusted')).toHaveLength(1);
  });

  it('un código equivocado no recuerda nada', async () => {
    const p = await persona();
    const agent = request.agent(app.getHttpServer());
    await login(agent, p);
    const res = await agent.post('/v1/auth/mfa/verify').send({ code: '000000', remember_device: true });
    expect(res.status).toBe(401);
    expect(deviceCookie(res)).toBeUndefined();
    expect(await devices(p.id)).toHaveLength(0);
  });
});

describe('entrar con un dispositivo recordado', () => {
  it('abre la sesión sin código con el rastro trusted_device, anota el último ingreso y no renueva el vencimiento', async () => {
    const p = await persona();
    const agent = request.agent(app.getHttpServer());
    await entrar(agent, p, true);
    const [antes] = await devices(p.id);
    const res = await login(agent, p, FIREFOX);
    expect(res.status).toBe(200);
    expect(res.body.data.next_step).toBeUndefined();
    expect(res.body.data.user.email).toBe(p.email);
    expect(setCookies(res).map((c) => c.split('=')[0])).toEqual(expect.arrayContaining(['mnk_access', 'mnk_refresh']));
    expect((await agent.get('/v1/auth/me')).status).toBe(200);
    const [despues] = await devices(p.id);
    expect(despues.last_used_at).not.toBeNull();
    expect(despues.expires_at.getTime()).toBe(antes.expires_at.getTime());
    // el navegador y el sistema son los de cuando se recordó
    expect(despues).toMatchObject({ browser: 'Chrome', os: 'Windows' });
    const logins = await audits(p.id, 'auth.login');
    expect(logins[logins.length - 1].after_state).toMatchObject({ mfa: 'trusted_device' });
    expect(logins[logins.length - 1].after_state['session_id']).toBeTruthy();
  });

  it('la contraseña se pide siempre: una mala sigue sumando al bloqueo, aun con dispositivo', async () => {
    const p = await persona();
    const agent = request.agent(app.getHttpServer());
    await entrar(agent, p, true);
    const res = await agent.post('/v1/auth/login').send({ email: p.email, password: 'Otra-Clave-Mala-1!' });
    expect(res.status).toBe(401);
    const [u] = await owner<{ failed_login_attempts: number }>('select failed_login_attempts from platform.users where id = $1', [p.id]);
    expect(u.failed_login_attempts).toBeGreaterThan(0);
    for (let i = 0; i < 5; i++) await agent.post('/v1/auth/login').send({ email: p.email, password: 'Otra-Clave-Mala-1!' });
    const locked = await login(agent, p);
    expect(locked.status).toBe(403);
    expect(locked.body.error.code).toBe('ACCOUNT_LOCKED');
  });

  it('vencido, revocado o manipulado: sin error, sigue el desafío normal', async () => {
    const p = await persona();
    const agent = request.agent(app.getHttpServer());
    await entrar(agent, p, true);
    const [d] = await devices(p.id);

    const manipulada = await http().post('/v1/auth/login').set('Cookie', 'mnk_device=no-es-un-token').send({ email: p.email, password: PASSWORD });
    expect(manipulada.status).toBe(200);
    expect(manipulada.body.data.next_step).toBe('mfa_verify');

    await owner(`update platform.trusted_devices set expires_at = now() - interval '1 minute' where id = $1`, [d.id]);
    expect((await login(agent, p)).body.data.next_step).toBe('mfa_verify');

    await owner(`update platform.trusted_devices set expires_at = now() + interval '1 day', revoked_at = now() where id = $1`, [d.id]);
    expect((await login(agent, p)).body.data.next_step).toBe('mfa_verify');
  });

  it('el dispositivo de otra persona en el mismo navegador no sirve: ve su código; si esa marca recordar, pisa la cookie y la primera vuelve a ver el suyo', async () => {
    const uno = await persona();
    const dos = await persona('auditor');
    const agent = request.agent(app.getHttpServer());
    await entrar(agent, uno, true);
    const first = await login(agent, dos);
    expect(first.status).toBe(200);
    expect(first.body.data.next_step).toBe('mfa_verify');
    const verified = await agent.post('/v1/auth/mfa/verify').send({ code: await code(dos.email, dos.secret), remember_device: true });
    expect(verified.status).toBe(200);
    expect(deviceCookie(verified)).toBeDefined();
    expect((await login(agent, dos)).body.data.next_step).toBeUndefined();
    expect((await login(agent, uno)).body.data.next_step).toBe('mfa_verify');
  });

  it('un admin_monkey nunca entra por dispositivo, aunque haya una fila que lo permita', async () => {
    const m = await persona('admin_monkey');
    const agent = request.agent(app.getHttpServer());
    const token = 'token-de-prueba-admin';
    const hash = createHmac('sha256', process.env['TOKEN_HASH_PEPPER'] as string).update(token).digest('hex');
    await owner(`insert into platform.trusted_devices (id, company_id, user_id, token_hash, ip_address, expires_at) values ($1, (select company_id from platform.users where id = $2), $2, $3, '1.1.1.1', now() + interval '1 day')`, [randomUUID(), m.id, hash]);
    const res = await agent.post('/v1/auth/login').set('Cookie', `mnk_device=${token}`).send({ email: m.email, password: PASSWORD });
    expect(res.body.data.next_step).toBe('mfa_verify');
  });
});

describe('cerrar sesión', () => {
  it('olvida el dispositivo de este navegador, borra la cookie, deja rastro y el siguiente ingreso pide el código; sigue siendo idempotente', async () => {
    const p = await persona();
    const agent = request.agent(app.getHttpServer());
    await entrar(agent, p, true);
    const out = await agent.post('/v1/auth/logout');
    expect(out.status).toBe(204);
    expect(deviceCookie(out)).toMatch(/mnk_device=;/);
    const [d] = await devices(p.id);
    expect(d.revoked_at).not.toBeNull();
    const rastro = await audits(p.id, 'auth.device_revoked');
    expect(rastro).toHaveLength(1);
    expect(rastro[0].after_state).toEqual({ device_id: d.id, scope: 'logout' });
    expect((await login(agent, p)).body.data.next_step).toBe('mfa_verify');
    expect((await http().post('/v1/auth/logout')).status).toBe(204);
  });

  it('sin cookies de sesión (venció o no hay) pero con mnk_device: también lo olvida, con rastro, y el siguiente ingreso pide el código', async () => {
    const p = await persona();
    const trusted = await entrar(request.agent(app.getHttpServer()), p, true);
    const out = await http().post('/v1/auth/logout').set('Cookie', `mnk_device=${deviceToken(trusted)}`);
    expect(out.status).toBe(204);
    expect(deviceCookie(out)).toMatch(/mnk_device=;/);
    const [d] = await devices(p.id);
    expect(d.revoked_at).not.toBeNull();
    expect((await audits(p.id, 'auth.device_revoked')).map((r) => r.after_state)).toEqual([{ device_id: d.id, scope: 'logout' }]);
    expect((await http().post('/v1/auth/logout').set('Cookie', `mnk_device=${deviceToken(trusted)}`)).status).toBe(204);
    expect(await audits(p.id, 'auth.device_revoked')).toHaveLength(1);
    expect((await http().post('/v1/auth/logout').set('Cookie', 'mnk_device=basura')).status).toBe(204);
    expect((await login(request.agent(app.getHttpServer()).set('Cookie', `mnk_device=${deviceToken(trusted)}`) as unknown as Agent, p)).body.data.next_step).toBe('mfa_verify');
  });

  it('con la sesión vencida (refresh sin sesión) también olvida el dispositivo', async () => {
    const p = await persona();
    const trusted = await entrar(request.agent(app.getHttpServer()), p, true);
    const out = await http().post('/v1/auth/logout').set('Cookie', ['mnk_refresh=token-que-no-existe', `mnk_device=${deviceToken(trusted)}`]);
    expect(out.status).toBe(204);
    expect(await vigentes(p.id)).toBe(0);
  });

  it('el dispositivo de la cookie solo cae si es de quien cierra sesión', async () => {
    const uno = await persona();
    const dos = await persona('auditor');
    const trusted = await entrar(request.agent(app.getHttpServer()), uno, true);
    const a2 = request.agent(app.getHttpServer());
    await entrar(a2, dos, false);
    const out = await a2.post('/v1/auth/logout').set('Cookie', `mnk_device=${deviceToken(trusted)}`);
    expect(out.status).toBe(204);
    expect(await vigentes(uno.id)).toBe(1);
    expect(await audits(uno.id, 'auth.device_revoked')).toHaveLength(0);
    expect(await audits(dos.id, 'auth.device_revoked')).toHaveLength(0);
  });
});

describe('se olvidan en la misma transacción que el cambio que los provoca', () => {
  it('recuperar la contraseña por enlace (forgot → reset)', async () => {
    const p = await persona();
    await owner('update platform.users set preferred_language = $2 where id = $1', [p.id, 'es']);
    await entrar(request.agent(app.getHttpServer()), p, true);
    await sembrar(p);
    expect(await vigentes(p.id)).toBe(2);
    correo.enviados.length = 0;
    expect((await http().post('/v1/auth/password/forgot').send({ email: p.email })).status).toBe(202);
    const sent = correo.paraEl(p.email).filter((m) => /https?:\/\/\S+/.test(m.text));
    const token = new URL(sent[sent.length - 1].text.match(/https?:\/\/\S+/)?.[0] as string).searchParams.get('token') as string;
    const res = await http().post('/v1/auth/password/reset').send({ token, new_password: 'Recuperada-Clave-789!', code: await code(p.email, p.secret) });
    expect(res.status).toBe(204);
    expect(await vigentes(p.id)).toBe(0);
  });

  it('cambiar la contraseña', async () => {
    const p = await persona();
    const agent = request.agent(app.getHttpServer());
    await entrar(agent, p, true);
    const id = await sembrar(p);
    const res = await agent.post('/v1/auth/password/change').send({ current_password: PASSWORD, new_password: 'Otra-Clave-Larga-456!', code: totpAt(p.secret, new Date(Date.now() + 30_000)) });
    expect(res.status).toBe(204);
    expect(await vigentes(p.id)).toBe(0);
    expect((await devices(p.id)).find((d) => d.id === id)?.revoked_at).not.toBeNull();
  });

  it('regenerar los códigos de recuperación', async () => {
    const p = await persona();
    const agent = request.agent(app.getHttpServer());
    await entrar(agent, p, true);
    expect(await vigentes(p.id)).toBe(1);
    const res = await agent.post('/v1/auth/mfa/recovery-codes').send({ code: totpAt(p.secret, new Date(Date.now() + 30_000)) });
    expect(res.status).toBe(200);
    expect(await vigentes(p.id)).toBe(0);
  });

  it('restablecer el segundo factor (admin_empresa) y la desactivación del integrante', async () => {
    const p = await persona();
    const q = await persona('auditor');
    await sembrar(p);
    await sembrar(q);
    expect((await a.agent.delete(`/v1/users/${p.id}/mfa`)).status).toBe(204);
    expect(await vigentes(p.id)).toBe(0);
    const baja = await a.agent.patch(`/v1/users/${q.id}`).send({ status: 'inactive' });
    expect(baja.status).toBe(200);
    expect(await vigentes(q.id)).toBe(0);
  });

  it('el script mfa:reset', async () => {
    const p = await persona();
    await sembrar(p);
    await owner(`update platform.trusted_devices set revoked_at = null where user_id = $1`, [p.id]);
    const { execFileSync } = await import('node:child_process');
    execFileSync('npx', ['tsx', 'prisma/seed/reset-mfa.ts', '--apply'], { env: { ...process.env, DATABASE_URL: process.env['TEST_DATABASE_URL'], MFA_RESET_EMAIL: p.email }, stdio: 'pipe' });
    expect(await vigentes(p.id)).toBe(0);
  });
});

describe('admin_monkey', () => {
  it('recordar: 422 REMEMBER_DEVICE_NOT_ALLOWED antes de mirar el código; no lo gasta ni suma intento', async () => {
    const m = await persona('admin_monkey', false);
    const agent = request.agent(app.getHttpServer());
    await login(agent, m);
    const secret = (await agent.post('/v1/auth/mfa/setup').send()).body.data.secret;
    const setup = await agent.post('/v1/auth/mfa/setup/confirm').send({ code: '000000', remember_device: true });
    expect(setup.status).toBe(422);
    expect(setup.body.error.code).toBe('REMEMBER_DEVICE_NOT_ALLOWED');
    const confirmed = await agent.post('/v1/auth/mfa/setup/confirm').send({ code: totpAt(secret, new Date()) });
    expect(confirmed.status).toBe(200);

    const other = request.agent(app.getHttpServer());
    await login(other, { ...m, secret });
    const c = totpAt(secret, new Date());
    const refused = await other.post('/v1/auth/mfa/verify').send({ code: c, remember_device: true });
    expect(refused.status).toBe(422);
    expect(refused.body.error.code).toBe('REMEMBER_DEVICE_NOT_ALLOWED');
    const [u] = await owner<{ failed_login_attempts: number; mfa_last_used_step: string | null }>('select failed_login_attempts, mfa_last_used_step from platform.users where id = $1', [m.id]);
    expect(u.failed_login_attempts).toBe(0);
    await owner('update platform.users set mfa_last_used_step = null where id = $1', [m.id]);
    const entered = await other.post('/v1/auth/mfa/verify').send({ code: c });
    expect(entered.status).toBe(200);
    expect(deviceCookie(entered)).toBeUndefined();
    expect(await devices(m.id)).toHaveLength(0);

    for (const res of [await other.get('/v1/auth/devices'), await other.delete('/v1/auth/devices'), await other.delete(`/v1/auth/devices/${randomUUID()}`)]) expect(res.status).toBe(403);
  });
});

describe('GET/DELETE /v1/auth/devices', () => {
  it('sin sesión: 401', async () => {
    expect((await http().get('/v1/auth/devices')).status).toBe(401);
    expect((await http().delete('/v1/auth/devices')).status).toBe(401);
    expect((await http().delete(`/v1/auth/devices/${randomUUID()}`)).status).toBe(401);
  });

  it('lista solo los vigentes de la persona, el más reciente primero, con la forma del contrato e is_current', async () => {
    const p = await persona();
    const otra = await persona('auditor');
    const agent = request.agent(app.getHttpServer());
    const trusted = await entrar(agent, p, true);
    const viejo = await sembrar(p, { created: new Date(Date.now() - 5 * 86_400_000).toISOString(), city: { es: 'Bogotá', en: 'Bogota' } });
    await sembrar(p, { expires: new Date(Date.now() - 1000).toISOString() });
    await sembrar(p, { revoked: true });
    await sembrar(otra);

    const res = await agent.get('/v1/auth/devices');
    expect(res.status).toBe(200);
    const data = res.body.data as Array<Record<string, unknown>>;
    expect(data).toHaveLength(2);
    expect(data[1]['id']).toBe(viejo);
    expect(Object.keys(data[0]).sort()).toEqual(['browser', 'city', 'country', 'created_at', 'device_type', 'expires_at', 'id', 'ip_address', 'is_current', 'last_used_at', 'os']);
    expect(data[0]).toMatchObject({ browser: 'Chrome', os: 'Windows', device_type: 'computer', is_current: true, last_used_at: null });
    expect(data[1]).toMatchObject({ is_current: false, country: 'CO', city: 'Bogotá', device_type: 'computer' }); // fila sin device_type: se deduce del os guardado (Linux)
    expect(JSON.stringify(res.body)).not.toContain(deviceToken(trusted));
    expect(JSON.stringify(res.body)).not.toContain('token');
    const en = await agent.get('/v1/auth/devices').set('Accept-Language', 'en');
    expect((en.body.data as Array<{ city: string | null }>)[1].city).toBe('Bogota');
  });

  it('device_type: computador de escritorio y celular según el user agent al recordar; null en la base si no se reconoce', async () => {
    const p = await persona();
    const escritorio = request.agent(app.getHttpServer());
    await entrar(escritorio, p, true, FIREFOX);
    const celular = request.agent(app.getHttpServer());
    await entrar(celular, p, true, IPHONE);
    const guardados = await owner<{ os: string; device_type: string | null }>('select os, device_type from platform.trusted_devices where user_id = $1 order by created_at', [p.id]);
    expect(guardados).toEqual([{ os: 'Ubuntu', device_type: 'computer' }, { os: 'iOS', device_type: 'mobile' }]);
    const res = await celular.get('/v1/auth/devices');
    const data = res.body.data as Array<{ os: string; device_type: string }>;
    expect(data.map((d) => [d.os, d.device_type])).toEqual([['iOS', 'mobile'], ['Ubuntu', 'computer']]);
  });

  it('olvidar uno: 204 con rastro scope one; el de otra persona o uno inexistente o vencido: 404 DEVICE_NOT_FOUND; si es el actual borra la cookie', async () => {
    const p = await persona();
    const otra = await persona('auditor');
    const agent = request.agent(app.getHttpServer());
    await entrar(agent, p, true);
    const ajeno = await sembrar(otra);
    const vencido = await sembrar(p, { expires: new Date(Date.now() - 1000).toISOString() });
    for (const id of [ajeno, vencido, randomUUID()]) {
      const res = await agent.delete(`/v1/auth/devices/${id}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('DEVICE_NOT_FOUND');
    }
    expect((await agent.delete('/v1/auth/devices/no-es-uuid')).status).toBe(404);
    expect(await vigentes(otra.id)).toBe(1);

    const otroDisp = await sembrar(p);
    const uno = await agent.delete(`/v1/auth/devices/${otroDisp}`);
    expect(uno.status).toBe(204);
    expect(deviceCookie(uno)).toBeUndefined();
    expect((await audits(p.id, 'auth.device_revoked'))[0].after_state).toEqual({ device_id: otroDisp, scope: 'one' });
    expect((await agent.delete(`/v1/auth/devices/${otroDisp}`)).status).toBe(404);

    const actual = (await agent.get('/v1/auth/devices')).body.data.find((d: { is_current: boolean }) => d.is_current).id;
    const borra = await agent.delete(`/v1/auth/devices/${actual}`);
    expect(borra.status).toBe(204);
    expect(deviceCookie(borra)).toMatch(/mnk_device=;/);
    expect((await login(agent, p)).body.data.next_step).toBe('mfa_verify');
  });

  it('olvidar todos: 204 idempotente, limpia la cookie y deja rastro scope all con count solo si olvidó alguno', async () => {
    const p = await persona();
    const otra = await persona('auditor');
    const agent = request.agent(app.getHttpServer());
    await entrar(agent, p, true);
    await sembrar(p);
    await sembrar(otra);
    const res = await agent.delete('/v1/auth/devices');
    expect(res.status).toBe(204);
    expect(deviceCookie(res)).toMatch(/mnk_device=;/);
    expect(await vigentes(p.id)).toBe(0);
    expect(await vigentes(otra.id)).toBe(1);
    expect((await audits(p.id, 'auth.device_revoked')).map((r) => r.after_state)).toEqual([{ scope: 'all', count: 2 }]);
    expect((await agent.delete('/v1/auth/devices')).status).toBe(204);
    expect(await audits(p.id, 'auth.device_revoked')).toHaveLength(1);
  });
});

// Al final: archivar deja a la empresa de prueba fuera de servicio.
describe('archivar la empresa y dar de baja a un administrador de Monkey', () => {
  it('archivar la empresa y desactivar a un administrador de Monkey', async () => {
    const otra = await persona('responsable');
    process.env['MFA_REQUIRED'] = 'false';
    try {
      const owned = [{ company_id: await monkeyCompany() }];
      const objetivo = randomUUID();
      await owner(`insert into platform.users (id, company_id, email, password_hash, role, status) values ($1, $2, $3, 'x', 'admin_monkey', 'active')`, [objetivo, owned[0].company_id, `objetivo-${RUN}@dispositivos.test`]);
      await owner(`insert into platform.trusted_devices (id, company_id, user_id, token_hash, ip_address, expires_at) values (gen_random_uuid(), $1, $2, $3, '1.1.1.1', now() + interval '1 day')`, [owned[0].company_id, objetivo, `h-${objetivo}`]);
      const baja = await monkey.post(`/v1/admins/${objetivo}/deactivation`).send({ totp_code: '000000' });
      expect(baja.status).toBe(200);
      expect(await vigentes(objetivo)).toBe(0);

      await sembrar(otra);
      const archivada = await monkey.post(`/v1/companies/${a.companyId}/deactivation`).send({ confirm_name: a.companyName, reason_code: 'non_payment', reason: 'Dos facturas vencidas.' });
      expect(archivada.status).toBe(200);
      expect(await vigentes(otra.id)).toBe(0);
    } finally {
      process.env['MFA_REQUIRED'] = 'true';
    }
  });
});
