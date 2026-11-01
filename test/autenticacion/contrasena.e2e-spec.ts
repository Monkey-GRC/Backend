import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { totpAt } from '../../src/features/auth/domain/totp';
import { bootApp, owner, PASSWORD } from '../support/app';
import { correo } from '../support/correo-en-memoria';
import { dosEmpresas, Tenant } from '../support/escenario';

// Cambio y recuperación de contraseña (SEG-14, D101): la contraseña no vence; la persona la cambia cuando quiere (con la actual y el segundo factor) y la recupera
// con un enlace de un solo uso más el segundo factor. Cualquier cambio cierra sesiones y avisa por correo.
let app: INestApplication;
let a: Tenant;
let secret = '';
let recoveryCodes: string[] = [];
let current = PASSWORD;

const NUEVA = ['Segunda-Clave-2026!', 'Tercera-Clave-2026!', 'Cuarta-Clave-2026!', 'Quinta-Clave-2026!', 'Sexta-Clave-2026!'];
const BASE_URL = 'http://platform.test';

const http = () => request(app.getHttpServer());

// Un código de la app que no choca con «un código ya usado»: se libera el último paso para poder pedir varios dentro de los mismos 30 s.
async function code(): Promise<string> {
  await owner('update platform.users set mfa_last_used_step = null where email = $1', [a.email]);
  return totpAt(secret, new Date());
}

async function signIn(email: string, password: string): Promise<request.Agent> {
  const agent = request.agent(app.getHttpServer());
  const res = await agent.post('/v1/auth/login').send({ email, password });
  expect(res.status).toBe(200);
  const verified = await agent.post('/v1/auth/mfa/verify').send({ code: await code() });
  expect(verified.status).toBe(200);
  return agent;
}

const unlock = () => owner('update platform.users set failed_login_attempts = 0, locked_until = null where email = $1', [a.email]);
// Los 3 cambios por día se cuentan en el historial: se envejece para poder seguir probando.
const ageHistory = () => owner(`update platform.password_history set created_at = created_at - interval '2 days' where user_id = (select id from platform.users where email = $1)`, [a.email]);
const resetLinkFor = (email: string): string => {
  const sent = correo.paraEl(email).filter((m) => m.subject.includes('Crea tu contraseña'));
  const link = sent[sent.length - 1]?.text.match(/https?:\/\/\S+/)?.[0];
  if (!link) throw new Error(`No se envió el enlace de recuperación a ${email}`);
  return new URL(link).searchParams.get('token') as string;
};

beforeAll(async () => {
  app = await bootApp({ PLATFORM_APP_URL: BASE_URL });
  ({ a } = await dosEmpresas(app));
  // Las empresas se armaron sin el segundo factor; la contraseña nueva lo exige, así que se configura aquí y desde ahora es obligatorio.
  process.env['MFA_REQUIRED'] = 'true';
  const agent = request.agent(app.getHttpServer());
  await agent.post('/v1/auth/login').send({ email: a.email, password: PASSWORD });
  secret = (await agent.post('/v1/auth/mfa/setup').send()).body.data.secret;
  const confirmed = await agent.post('/v1/auth/mfa/setup/confirm').send({ code: totpAt(secret, new Date()) });
  expect(confirmed.status).toBe(200);
  recoveryCodes = confirmed.body.data.recovery_codes;
});
afterAll(async () => {
  process.env['MFA_REQUIRED'] = 'false';
  await app?.close();
});

describe('cambio voluntario — POST /v1/auth/password/change', () => {
  it('sin sesión: 401', async () => {
    const res = await http().post('/v1/auth/password/change').send({ current_password: current, new_password: NUEVA[0], code: '123456' });
    expect(res.status).toBe(401);
  });

  it('la contraseña actual equivocada: 403 CURRENT_PASSWORD_INVALID, suma al bloqueo y no cambia nada', async () => {
    const agent = await signIn(a.email, current);
    const res = await agent.post('/v1/auth/password/change').send({ current_password: 'Otra-Clave-Mala-1!', new_password: NUEVA[0], code: await code() });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CURRENT_PASSWORD_INVALID');
    const [u] = await owner<{ failed_login_attempts: number }>('select failed_login_attempts from platform.users where email = $1', [a.email]);
    expect(u.failed_login_attempts).toBeGreaterThan(0);
    await unlock();
    expect((await http().post('/v1/auth/login').send({ email: a.email, password: current })).status).toBe(200);
  });

  it('el código equivocado: 401 MFA_CODE_INVALID', async () => {
    const agent = await signIn(a.email, current);
    const res = await agent.post('/v1/auth/password/change').send({ current_password: current, new_password: NUEVA[0], code: '000000' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('MFA_CODE_INVALID');
    await unlock();
  });

  it('sin código ni código de recuperación: 422 por campo', async () => {
    const agent = await signIn(a.email, current);
    const res = await agent.post('/v1/auth/password/change').send({ current_password: current, new_password: NUEVA[0] });
    expect(res.status).toBe(422);
  });

  it('una contraseña débil: 422 y no gasta el código', async () => {
    const agent = await signIn(a.email, current);
    const res = await agent.post('/v1/auth/password/change').send({ current_password: current, new_password: 'corta', code: await code() });
    expect(res.status).toBe(422);
  });

  it('la misma contraseña: 422 PASSWORD_REUSED', async () => {
    const agent = await signIn(a.email, current);
    const res = await agent.post('/v1/auth/password/change').send({ current_password: current, new_password: current, code: await code() });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('PASSWORD_REUSED');
  });

  it('cambia la contraseña: 204, la sesión de origen sigue, las demás se cierran, avisa por correo y deja rastro', async () => {
    const other = await signIn(a.email, current);
    const origin = await signIn(a.email, current);
    correo.enviados.length = 0;

    const res = await origin.post('/v1/auth/password/change').send({ current_password: current, new_password: NUEVA[0], code: await code() });
    expect(res.status).toBe(204);
    expect(res.text).toBe('');
    current = NUEVA[0];

    expect((await origin.get('/v1/auth/me')).status).toBe(200);
    expect((await other.get('/v1/auth/me')).status).toBe(401);
    expect((await http().post('/v1/auth/login').send({ email: a.email, password: PASSWORD })).status).toBe(401);
    expect((await http().post('/v1/auth/login').send({ email: a.email, password: current })).status).toBe(200);

    expect(correo.paraEl(a.email).some((m) => m.subject.includes('Cambió la contraseña'))).toBe(true);
    // El aviso no lleva la contraseña.
    for (const m of correo.enviados) expect(`${m.text}${m.html ?? ''}`).not.toContain(NUEVA[0]);

    const [log] = await owner<{ after_state: { via: string } }>(`select after_state from audit.audit_logs where tenant_id = $1 and action = 'auth.password_changed' order by created_at desc limit 1`, [a.companyId]);
    expect(log.after_state.via).toBe('change');
    expect(JSON.stringify(log)).not.toContain(NUEVA[0]);
    const [u] = await owner<{ password_hash: string }>('select password_hash from platform.users where email = $1', [a.email]);
    expect(u.password_hash).not.toContain(NUEVA[0]);
  });

  it('no puede volver a una contraseña reciente', async () => {
    const agent = await signIn(a.email, current);
    const res = await agent.post('/v1/auth/password/change').send({ current_password: current, new_password: PASSWORD, code: await code() });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('PASSWORD_REUSED');
  });

  it('acepta un código de recuperación en lugar del código de la app, y lo gasta', async () => {
    const agent = await signIn(a.email, current);
    const res = await agent.post('/v1/auth/password/change').send({ current_password: current, new_password: NUEVA[1], recovery_code: recoveryCodes[0] });
    expect(res.status).toBe(204);
    current = NUEVA[1];
    const again = await (await signIn(a.email, current)).post('/v1/auth/password/change').send({ current_password: current, new_password: NUEVA[2], recovery_code: recoveryCodes[0] });
    expect(again.status).toBe(401);
    await unlock();
  });

  it('más de 3 cambios en 24 h: 429 PASSWORD_CHANGE_LIMIT; pasado el día se puede de nuevo', async () => {
    await ageHistory();
    const agent = await signIn(a.email, current);
    for (const next of [NUEVA[2], NUEVA[3], NUEVA[4]]) {
      const ok = await agent.post('/v1/auth/password/change').send({ current_password: current, new_password: next, code: await code() });
      expect(ok.status).toBe(204);
      current = next;
    }
    const limited = await agent.post('/v1/auth/password/change').send({ current_password: current, new_password: 'Septima-Clave-2026!', code: await code() });
    expect(limited.status).toBe(429);
    expect(limited.body.error.code).toBe('PASSWORD_CHANGE_LIMIT');

    await ageHistory();
    const later = await agent.post('/v1/auth/password/change').send({ current_password: current, new_password: 'Septima-Clave-2026!', code: await code() });
    expect(later.status).toBe(204);
    current = 'Septima-Clave-2026!';
  });

  it('el historial guarda las anteriores solo como hash', async () => {
    const rows = await owner<{ password_hash: string }>(`select h.password_hash from platform.password_history h join platform.users u on u.id = h.user_id where u.email = $1`, [a.email]);
    expect(rows.length).toBeGreaterThanOrEqual(5);
    for (const row of rows) expect(row.password_hash).toMatch(/^\$2[aby]\$/);
  });
});

describe('olvidé mi contraseña — forgot y reset', () => {
  it('responde 202 y lo mismo exista o no la cuenta, y solo envía correo a la que existe', async () => {
    correo.enviados.length = 0;
    const unknown = await http().post('/v1/auth/password/forgot').send({ email: `nadie-${Date.now()}@ejemplo.com` });
    const known = await http().post('/v1/auth/password/forgot').send({ email: a.email });
    expect(unknown.status).toBe(202);
    expect(known.status).toBe(202);
    expect(known.body).toEqual(unknown.body);
    await new Promise((r) => setTimeout(r, 50));
    expect(correo.enviados).toHaveLength(1);
    expect(correo.enviados[0].to).toBe(a.email);
    expect(correo.enviados[0].text).toContain(`${BASE_URL}/reset-password?token=`);
  });

  it('el token solo queda como huella en la base', async () => {
    const token = resetLinkFor(a.email);
    const rows = await owner<{ token_hash: string }>(`select t.token_hash from platform.password_reset_tokens t join platform.users u on u.id = t.user_id where u.email = $1`, [a.email]);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row.token_hash).not.toBe(token);
  });

  it('un enlace nuevo deja sin efecto el anterior', async () => {
    const first = resetLinkFor(a.email);
    await http().post('/v1/auth/password/forgot').send({ email: a.email });
    await new Promise((r) => setTimeout(r, 50));
    const second = resetLinkFor(a.email);
    expect(second).not.toBe(first);
    const stale = await http().post('/v1/auth/password/reset').send({ token: first, new_password: 'Octava-Clave-2026!', code: await code() });
    expect(stale.status).toBe(401);
    expect(stale.body.error.code).toBe('PASSWORD_RESET_INVALID');
  });

  it('un token que no existe: 401 PASSWORD_RESET_INVALID', async () => {
    const res = await http().post('/v1/auth/password/reset').send({ token: 'no-existe', new_password: 'Octava-Clave-2026!', code: await code() });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('PASSWORD_RESET_INVALID');
  });

  it('sin el segundo factor no cambia nada: 401 MFA_CODE_INVALID y el enlace sigue sirviendo', async () => {
    const token = resetLinkFor(a.email);
    const res = await http().post('/v1/auth/password/reset').send({ token, new_password: 'Octava-Clave-2026!' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('MFA_CODE_INVALID');
    const bad = await http().post('/v1/auth/password/reset').send({ token, new_password: 'Octava-Clave-2026!', code: '000000' });
    expect(bad.status).toBe(401);
    await unlock();
    expect((await http().post('/v1/auth/login').send({ email: a.email, password: current })).status).toBe(200);
  });

  it('una de las 5 anteriores: 422 PASSWORD_REUSED (la original ya salió de esa ventana)', async () => {
    const res = await http().post('/v1/auth/password/reset').send({ token: resetLinkFor(a.email), new_password: NUEVA[4], code: await code() });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('PASSWORD_REUSED');
  });

  it('con enlace y código: 204, cierra TODAS las sesiones, avisa y el enlace no se reutiliza', async () => {
    await ageHistory();
    const open = await signIn(a.email, current);
    const token = resetLinkFor(a.email);
    correo.enviados.length = 0;

    const res = await http().post('/v1/auth/password/reset').send({ token, new_password: 'Octava-Clave-2026!', code: await code() });
    expect(res.status).toBe(204);
    current = 'Octava-Clave-2026!';

    expect((await open.get('/v1/auth/me')).status).toBe(401);
    expect((await http().post('/v1/auth/login').send({ email: a.email, password: current })).status).toBe(200);
    expect(correo.paraEl(a.email).some((m) => m.subject.includes('Cambió la contraseña'))).toBe(true);

    const again = await http().post('/v1/auth/password/reset').send({ token, new_password: 'Novena-Clave-2026!', code: await code() });
    expect(again.status).toBe(401);
    expect(again.body.error.code).toBe('PASSWORD_RESET_INVALID');

    const [log] = await owner<{ after_state: { via: string } }>(`select after_state from audit.audit_logs where tenant_id = $1 and action = 'auth.password_reset' order by created_at desc limit 1`, [a.companyId]);
    expect(log.after_state.via).toBe('reset');
    expect(JSON.stringify(log)).not.toContain(token);
  });

  it('un enlace vencido: 401 PASSWORD_RESET_INVALID', async () => {
    await http().post('/v1/auth/password/forgot').send({ email: a.email });
    await new Promise((r) => setTimeout(r, 50));
    const token = resetLinkFor(a.email);
    await owner(`update platform.password_reset_tokens set expires_at = now() - interval '1 minute' where user_id = (select id from platform.users where email = $1) and used_at is null`, [a.email]);
    const res = await http().post('/v1/auth/password/reset').send({ token, new_password: 'Novena-Clave-2026!', code: await code() });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('PASSWORD_RESET_INVALID');
  });

  it('acepta un código de recuperación en lugar del de la app', async () => {
    await http().post('/v1/auth/password/forgot').send({ email: a.email });
    await new Promise((r) => setTimeout(r, 50));
    const res = await http().post('/v1/auth/password/reset').send({ token: resetLinkFor(a.email), new_password: 'Novena-Clave-2026!', recovery_code: recoveryCodes[1] });
    expect(res.status).toBe(204);
    current = 'Novena-Clave-2026!';
  });

  it('una cuenta suspendida no recibe enlace', async () => {
    await owner(`update platform.users set status = 'inactive' where email = $1`, [a.email]);
    correo.enviados.length = 0;
    const res = await http().post('/v1/auth/password/forgot').send({ email: a.email });
    await new Promise((r) => setTimeout(r, 50));
    await owner(`update platform.users set status = 'active' where email = $1`, [a.email]);
    expect(res.status).toBe(202);
    expect(correo.paraEl(a.email)).toHaveLength(0);
  });

  it('más de 5 enlaces por hora: sigue respondiendo 202 pero deja de enviar', async () => {
    await owner(`delete from platform.password_reset_tokens where user_id = (select id from platform.users where email = $1)`, [a.email]);
    correo.enviados.length = 0;
    for (let i = 0; i < 7; i += 1) expect((await http().post('/v1/auth/password/forgot').send({ email: a.email })).status).toBe(202);
    await new Promise((r) => setTimeout(r, 100));
    expect(correo.paraEl(a.email)).toHaveLength(5);
  });

  it('un correo mal formado: 422', async () => {
    expect((await http().post('/v1/auth/password/forgot').send({ email: 'no-es-un-correo' })).status).toBe(422);
  });
});
