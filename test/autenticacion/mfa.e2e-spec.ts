import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { totpAt, totpStep } from '../../src/features/auth/domain/totp';
import { bootApp, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// Segundo factor (TOTP) de los 5 roles (SEG-16, D94): de la contraseña correcta al desafío, del desafío a la sesión, el código de un solo uso, los códigos de
// recuperación, el bloqueo, y cómo se restablece a quien lo perdió.
let app: INestApplication;
let a: Tenant;

beforeAll(async () => {
  app = await bootApp();
  ({ a } = await dosEmpresas(app));
  // Las empresas se armaron con el segundo factor apagado (como todas las demás pruebas); desde aquí es obligatorio.
  process.env['MFA_REQUIRED'] = 'true';
});
afterAll(async () => {
  process.env['MFA_REQUIRED'] = 'false';
  await app?.close();
});

const http = () => request(app.getHttpServer());
const cookiesOf = (res: request.Response) => ((res.headers['set-cookie'] as unknown as string[] | undefined) ?? []).map((c) => c.split(';')[0].split('=')[0]);
const signIn = (agent: request.Agent, email: string) => agent.post('/v1/auth/login').send({ email, password: PASSWORD });

describe('primer ingreso: configurar el segundo factor', () => {
  let secret = '';
  let recoveryCodes: string[] = [];
  const email = () => a.email;

  it('la contraseña correcta no abre sesión: devuelve el siguiente paso y deja solo el desafío', async () => {
    const res = await signIn(request.agent(app.getHttpServer()), email());
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ next_step: 'mfa_setup' });
    expect(res.body.data.expires_at).toBeTruthy();
    expect(res.body.data.user).toBeUndefined();
    expect(cookiesOf(res)).toEqual(['mnk_mfa']); // ni mnk_access ni mnk_refresh
  });

  it('sin el desafío no hay QR ni confirmación: 401', async () => {
    expect((await http().post('/v1/auth/mfa/setup').send()).status).toBe(401);
    expect((await http().post('/v1/auth/mfa/setup/confirm').send({ code: '123456' })).status).toBe(401);
  });

  it('pide el QR: secreto y dirección otpauth, y la segunda vez el mismo secreto', async () => {
    const a1 = request.agent(app.getHttpServer());
    expect((await signIn(a1, email())).status).toBe(200);
    const first = await a1.post('/v1/auth/mfa/setup').send();
    expect(first.status).toBe(200);
    secret = first.body.data.secret;
    expect(secret).toMatch(/^[A-Z2-7]{32}$/);
    expect(first.body.data.otpauth_uri).toContain(`secret=${secret}`);
    expect(first.body.data.otpauth_uri).toContain('issuer=Monkey');
    expect((await a1.post('/v1/auth/mfa/setup').send()).body.data.secret).toBe(secret);
    // el secreto espera cifrado en el desafío; el usuario sigue sin segundo factor
    const [pending] = await owner<{ pending_secret_encrypted: string }>(
      `select c.pending_secret_encrypted from platform.mfa_challenges c join platform.users u on u.id = c.user_id where u.email = $1 and c.consumed_at is null order by c.created_at desc limit 1`,
      [email()],
    );
    expect(pending.pending_secret_encrypted.startsWith('v1.')).toBe(true);
    expect(pending.pending_secret_encrypted).not.toContain(secret);
  });

  it('un código equivocado cuenta como intento fallido y no activa nada', async () => {
    const a1 = request.agent(app.getHttpServer());
    await signIn(a1, email());
    await a1.post('/v1/auth/mfa/setup').send();
    const res = await a1.post('/v1/auth/mfa/setup/confirm').send({ code: '000000' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('MFA_CODE_INVALID');
    const [u] = await owner<{ is_mfa_enabled: boolean; failed_login_attempts: number }>('select is_mfa_enabled, failed_login_attempts from platform.users where email = $1', [email()]);
    expect(u.is_mfa_enabled).toBe(false);
    expect(u.failed_login_attempts).toBeGreaterThan(0);
  });

  it('confirmar sin haber pedido el QR: 409', async () => {
    const a1 = request.agent(app.getHttpServer());
    await signIn(a1, email());
    expect((await a1.post('/v1/auth/mfa/setup/confirm').send({ code: '123456' })).status).toBe(409);
  });

  it('con el primer código: se activa, entrega 10 códigos de recuperación una sola vez y abre la sesión', async () => {
    const a1 = request.agent(app.getHttpServer());
    await signIn(a1, email());
    const started = await a1.post('/v1/auth/mfa/setup').send();
    secret = started.body.data.secret;
    const res = await a1.post('/v1/auth/mfa/setup/confirm').send({ code: totpAt(secret, new Date()) });
    expect(res.status).toBe(200);
    expect(res.body.data.user.is_mfa_enabled).toBe(true);
    recoveryCodes = res.body.data.recovery_codes;
    expect(recoveryCodes).toHaveLength(10);
    expect(cookiesOf(res)).toEqual(expect.arrayContaining(['mnk_access', 'mnk_refresh']));
    expect((await a1.get('/v1/auth/me')).status).toBe(200); // la sesión sirve

    // En la base: el secreto cifrado (nunca en claro), los códigos solo como huella, y el rastro.
    const [u] = await owner<{ mfa_secret_encrypted: string }>('select mfa_secret_encrypted from platform.users where email = $1', [email()]);
    expect(u.mfa_secret_encrypted.startsWith('v1.')).toBe(true);
    expect(u.mfa_secret_encrypted).not.toContain(secret);
    const hashes = await owner<{ code_hash: string }>('select r.code_hash from platform.user_recovery_codes r join platform.users u on u.id = r.user_id where u.email = $1', [email()]);
    expect(hashes).toHaveLength(10);
    for (const code of recoveryCodes) expect(hashes.map((h) => h.code_hash)).not.toContain(code.replace('-', ''));
    const [log] = await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = 'auth.mfa_enabled'`, [a.companyId]);
    expect(log.n).toBe(1);
  });

  it('el desafío ya consumido no se puede reusar', async () => {
    const res = await http().post('/v1/auth/mfa/setup/confirm').send({ code: totpAt(secret, new Date()) });
    expect(res.status).toBe(401);
  });

  describe('ingresos siguientes', () => {
    it('la contraseña correcta pide ahora el código (mfa_verify), sin abrir sesión', async () => {
      const res = await signIn(request.agent(app.getHttpServer()), email());
      expect(res.body.data.next_step).toBe('mfa_verify');
      expect(cookiesOf(res)).toEqual(['mnk_mfa']);
    });

    it('un código ya usado no sirve otra vez, aunque siga dentro de su ventana', async () => {
      // El paso de ahora ya está gastado (como si acabara de entrar con él). Se fija explícito: depender de «el paso de la activación» fallaba si la prueba cruzaba el límite de 30 s.
      await owner('update platform.users set mfa_last_used_step = $2 where email = $1', [email(), totpStep(new Date())]);
      const a1 = request.agent(app.getHttpServer());
      await signIn(a1, email());
      const spent = await a1.post('/v1/auth/mfa/verify').send({ code: totpAt(secret, new Date()) });
      expect(spent.status).toBe(401);
      expect(spent.body.error.code).toBe('MFA_CODE_INVALID');
    });

    it('un código del paso siguiente sí entra, y la sesión queda abierta con su rastro', async () => {
      const a1 = request.agent(app.getHttpServer());
      await signIn(a1, email());
      const next = totpAt(secret, new Date(Date.now() + 30_000));
      expect(totpStep(new Date(Date.now() + 30_000))).toBeGreaterThan(totpStep(new Date()));
      const res = await a1.post('/v1/auth/mfa/verify').send({ code: next });
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(email());
      expect(cookiesOf(res)).toEqual(expect.arrayContaining(['mnk_access', 'mnk_refresh']));
      const [log] = await owner<{ after_state: { mfa: string } }>(`select after_state from audit.audit_logs where tenant_id = $1 and action = 'auth.login' order by created_at desc limit 1`, [a.companyId]);
      expect(log.after_state.mfa).toBe('totp');
    });

    it('un código de recuperación entra una vez y avisa cuántos quedan; el mismo no vuelve a servir', async () => {
      const a1 = request.agent(app.getHttpServer());
      await signIn(a1, email());
      const res = await a1.post('/v1/auth/mfa/verify').send({ recovery_code: recoveryCodes[0].toLowerCase() });
      expect(res.status).toBe(200);
      expect(res.body.data.recovery_codes_left).toBe(9);
      const a2 = request.agent(app.getHttpServer());
      await signIn(a2, email());
      expect((await a2.post('/v1/auth/mfa/verify').send({ recovery_code: recoveryCodes[0] })).status).toBe(401);
    });

    it('sin código ni código de recuperación: 422', async () => {
      const a1 = request.agent(app.getHttpServer());
      await signIn(a1, email());
      expect((await a1.post('/v1/auth/mfa/verify').send({})).status).toBe(422);
    });

    it('con la sesión abierta y un código vigente se piden códigos de recuperación nuevos, y los anteriores dejan de servir', async () => {
      // Las pruebas anteriores ya gastaron los pasos de la ventana (±1 paso de 30 s). Un código a +60 s son DOS pasos: ya no cabe en la ventana y siempre da 401.
      // Se reinicia el último paso usado para tener un código vigente de verdad: el actual para entrar y el siguiente (+30 s, dentro de la ventana) para pedir los nuevos.
      await owner('update platform.users set mfa_last_used_step = null where email = $1', [email()]);
      const a1 = request.agent(app.getHttpServer());
      await signIn(a1, email());
      expect((await a1.post('/v1/auth/mfa/verify').send({ code: totpAt(secret, new Date()) })).status).toBe(200);
      expect((await a1.post('/v1/auth/mfa/recovery-codes').send({ code: '000000' })).status).toBe(401);
      const fresh = await a1.post('/v1/auth/mfa/recovery-codes').send({ code: totpAt(secret, new Date(Date.now() + 30_000)) });
      expect(fresh.status).toBe(200);
      expect(fresh.body.data.recovery_codes).toHaveLength(10);
      const a2 = request.agent(app.getHttpServer());
      await signIn(a2, email());
      expect((await a2.post('/v1/auth/mfa/verify').send({ recovery_code: recoveryCodes[1] })).status).toBe(401);
    });
  });

  describe('bloqueo', () => {
    it('cinco códigos equivocados bloquean la cuenta 15 minutos', async () => {
      await owner('update platform.users set failed_login_attempts = 0, locked_until = null where email = $1', [email()]);
      const a1 = request.agent(app.getHttpServer());
      await signIn(a1, email());
      const statuses: number[] = [];
      for (let i = 0; i < 5; i++) statuses.push((await a1.post('/v1/auth/mfa/verify').send({ code: '111111' })).status);
      expect(statuses).toEqual([401, 401, 401, 401, 403]);
      const locked = await signIn(request.agent(app.getHttpServer()), email());
      expect(locked.status).toBe(403);
      expect(locked.body.error.code).toBe('ACCOUNT_LOCKED');
      await owner('update platform.users set failed_login_attempts = 0, locked_until = null where email = $1', [email()]);
    });
  });
});

describe('quitar el segundo factor a un integrante del equipo', () => {
  const memberEmail = `responsable-mfa-${RUN}@aislamiento.test`;
  let memberId = '';

  beforeAll(async () => {
    memberId = randomUUID();
    await owner(
      `insert into platform.users (id, company_id, email, password_hash, role, status, is_mfa_enabled, mfa_secret_encrypted) values ($1, $2, $3, $4, 'responsable', 'active', true, 'v1.x.y.z')`,
      [memberId, a.companyId, memberEmail, await bcrypt.hash(PASSWORD, 4)],
    );
    await owner(`insert into platform.user_recovery_codes (id, company_id, user_id, code_hash) values ($1, $2, $3, 'abc')`, [randomUUID(), a.companyId, memberId]);
    await owner(
      `insert into platform.sessions (id, company_id, user_id, refresh_token_hash, ip_address, user_agent, expires_at) values ($1, $2, $3, $4, '127.0.0.1', 'test', now() + interval '1 hour')`,
      [randomUUID(), a.companyId, memberId, `hash-${RUN}`],
    );
  });

  it('el administrador de la empresa lo quita: borra el secreto y los códigos, cierra las sesiones y deja rastro', async () => {
    const agent = request.agent(app.getHttpServer());
    // El administrador de esta empresa ya tiene el segundo factor desde las pruebas de arriba: entra con un código del futuro cercano.
    await signIn(agent, a.email);
    const [admin] = await owner<{ mfa_secret_encrypted: string }>('select mfa_secret_encrypted from platform.users where email = $1', [a.email]);
    expect(admin.mfa_secret_encrypted).toBeTruthy();
    // sin el secreto en claro no se puede firmar un código: para esta prueba basta con quitar el requisito del administrador
    process.env['MFA_REQUIRED'] = 'false';
    await owner('update platform.users set is_mfa_enabled = false, mfa_secret_encrypted = null where email = $1', [a.email]);
    const admin2 = request.agent(app.getHttpServer());
    expect((await signIn(admin2, a.email)).status).toBe(200);

    expect((await admin2.delete(`/v1/users/${memberId}/mfa`)).status).toBe(204);
    const [u] = await owner<{ is_mfa_enabled: boolean; mfa_secret_encrypted: string | null }>('select is_mfa_enabled, mfa_secret_encrypted from platform.users where id = $1', [memberId]);
    expect(u).toEqual({ is_mfa_enabled: false, mfa_secret_encrypted: null });
    expect((await owner('select 1 from platform.user_recovery_codes where user_id = $1', [memberId])).length).toBe(0);
    expect((await owner('select 1 from platform.sessions where user_id = $1 and revoked_at is null', [memberId])).length).toBe(0);
    const [log] = await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = 'auth.mfa_reset'`, [a.companyId]);
    expect(log.n).toBe(1);
    process.env['MFA_REQUIRED'] = 'true';
  });

  it('no se aplica a uno mismo, ni a un administrador, ni a alguien que no existe o es de otra empresa', async () => {
    process.env['MFA_REQUIRED'] = 'false';
    const admin = request.agent(app.getHttpServer());
    expect((await signIn(admin, a.email)).status).toBe(200);
    const [self] = await owner<{ id: string }>('select id from platform.users where email = $1', [a.email]);
    expect((await admin.delete(`/v1/users/${self.id}/mfa`)).status).toBe(403);
    expect((await admin.delete(`/v1/users/${randomUUID()}/mfa`)).status).toBe(404);
    process.env['MFA_REQUIRED'] = 'true';
  });
});
describe('D104 · el perfil del delegado en el segundo factor', () => {
  it('confirmar el segundo factor y verificar el código devuelven group y responsible del delegado', async () => {
    const respId = randomUUID();
    const teamId = randomUUID();
    const delId = randomUUID();
    const delEmail = `mfa-del-${RUN}@mfa.test`;
    const hash = await bcrypt.hash(PASSWORD, 4);
    await owner(`insert into platform.users (id, company_id, email, name, last_name, password_hash, role, status) values ($1, $2, $3, 'Rita', 'Lider', $4, 'responsable', 'active')`, [respId, a.companyId, `mfa-resp-${RUN}@mfa.test`, hash]);
    await owner(`insert into platform.user_groups (id, company_id, name, leader_id) values ($1, $2, $3, $4)`, [teamId, a.companyId, `Equipo mfa ${RUN}`, respId]);
    await owner(`insert into platform.users (id, company_id, email, password_hash, role, status, group_id, is_internal) values ($1, $2, $3, $4, 'delegado', 'active', $5, true)`, [delId, a.companyId, delEmail, hash, teamId]);

    const agent = request.agent(app.getHttpServer());
    await signIn(agent, delEmail);
    const secret = (await agent.post('/v1/auth/mfa/setup').send()).body.data.secret;
    const confirmed = await agent.post('/v1/auth/mfa/setup/confirm').send({ code: totpAt(secret, new Date()) });
    expect(confirmed.status).toBe(200);
    const expected = { group: { id: teamId, name: `Equipo mfa ${RUN}` }, responsible: { id: respId, name: 'Rita', last_name: 'Lider' } };
    expect(confirmed.body.data.user).toMatchObject(expected);

    const again = request.agent(app.getHttpServer());
    await signIn(again, delEmail);
    const verified = await again.post('/v1/auth/mfa/verify').send({ code: totpAt(secret, new Date(Date.now() + 30_000)) });
    expect(verified.status).toBe(200);
    expect(verified.body.data.user).toMatchObject(expected);
  });
});
