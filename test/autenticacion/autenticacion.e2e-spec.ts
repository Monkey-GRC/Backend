import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// Requisitos de autenticación (seguridad/requisitos.md, SEG-12, 13, 15, 17, 18, 23 y 24): lo que antes solo estaba
// «implementado» ahora lo demuestra una prueba que corre en el CI.
let app: INestApplication;
let a: Tenant;
let monkey: Awaited<ReturnType<typeof dosEmpresas>>['monkey'];

beforeAll(async () => {
  app = await bootApp();
  ({ a, monkey } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});

const http = () => request(app.getHttpServer());
const lastSession = async (email: string) =>
  (
    await owner<{ id: string }>(
      'select s.id from platform.sessions s join platform.users u on u.id = s.user_id where u.email = $1 order by s.created_at desc limit 1',
      [email],
    )
  )[0].id;

describe('SEG-13 · política de contraseña (12+, mayúscula, minúscula, número y símbolo)', () => {
  it('rechaza contraseñas débiles con el error por campo, sin gastar la clave; acepta una buena', async () => {
    const email = `politica-${RUN}@aislamiento.test`;
    const company = (await monkey.post('/v1/companies').send({ name: `Empresa política ${RUN}`, requires_dedicated_database: false, admin_email: email, framework_codes: ['soc2'] })).body.data;
    const weak = ['Corta1!', 'sinmayuscula123!', 'SINMINUSCULA123!', 'SinNumeroAquiii!', 'SinSimbolo12345'];
    for (const password of weak) {
      const res = await http().post('/v1/auth/redeem').send({ code: company.access_key.code, email, password });
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
      expect(JSON.stringify(res.body.error.fields)).toContain('password');
    }
    // La clave no se gastó con los intentos rechazados: una contraseña buena sigue sirviendo.
    expect((await http().post('/v1/auth/redeem').send({ code: company.access_key.code, email, password: PASSWORD })).status).toBe(201);
  });

  it('la contraseña se guarda con bcrypt, nunca en claro', async () => {
    const [row] = await owner<{ password_hash: string }>('select password_hash from platform.users where email = $1', [a.email]);
    expect(row.password_hash).toMatch(/^\$2[aby]\$\d{2}\$/);
    expect(row.password_hash).not.toContain(PASSWORD);
  });
});

describe('SEG-15 · bloqueo a los 5 intentos fallidos, por 15 min', () => {
  it('bloquea, no distingue usuario inexistente de contraseña mala, y se libera al vencer', async () => {
    // Estado limpio: la prueba no depende de lo que haya pasado antes con este usuario.
    await owner(`update platform.users set failed_login_attempts = 0, locked_until = null where email = $1`, [a.email]);
    const wrong = (email: string) => http().post('/v1/auth/login').send({ email, password: 'Incorrecta-1234!' });

    const unknown = await wrong(`no-existe-${RUN}@aislamiento.test`);
    const bad = await wrong(a.email);
    expect([unknown.status, bad.status]).toEqual([401, 401]);
    expect(unknown.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(bad.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(bad.body.message).toBe(unknown.body.message);

    for (let i = 0; i < 3; i++) expect((await wrong(a.email)).status).toBe(401); // van 4 fallos
    const fifth = await wrong(a.email);
    expect(fifth.status).toBe(403);
    expect(fifth.body.error.code).toBe('ACCOUNT_LOCKED');
    expect(JSON.stringify(fifth.body)).toMatch(/retry_after_seconds/);

    // SEG-37: los intentos fallidos dejan rastro aparte (sin tenant: el correo puede no existir). Con un usuario que existe
    // el rastro lleva su `user_id`; con un correo desconocido, el correo tecleado.
    const known = await owner<{ n: number }>(
      `select count(*)::int n from audit.audit_logs where action = 'auth.login_failed' and result = 'error' and user_id = (select id from platform.users where email = $1)`,
      [a.email],
    );
    expect(known[0].n).toBeGreaterThanOrEqual(5);
    const unknownTrail = await owner<{ n: number }>(
      `select count(*)::int n from audit.audit_logs where action = 'auth.login_failed' and attempted_email = $1`,
      [`no-existe-${RUN}@aislamiento.test`],
    );
    expect(unknownTrail[0].n).toBe(1);

    // Bloqueada: ni siquiera la contraseña correcta entra.
    const locked = await http().post('/v1/auth/login').send({ email: a.email, password: PASSWORD });
    expect(locked.status).toBe(403);
    expect(locked.body.error.code).toBe('ACCOUNT_LOCKED');
    const [row] = await owner<{ seconds: number }>('select extract(epoch from locked_until - now())::int seconds from platform.users where email = $1', [a.email]);
    expect(row.seconds).toBeGreaterThan(0);
    expect(row.seconds).toBeLessThanOrEqual(15 * 60);

    // Al vencer el bloqueo entra de nuevo y el contador vuelve a cero.
    await owner(`update platform.users set locked_until = now() - interval '1 second' where email = $1`, [a.email]);
    expect((await http().post('/v1/auth/login').send({ email: a.email, password: PASSWORD })).status).toBe(200);
    const [after] = await owner<{ failed_login_attempts: number }>('select failed_login_attempts from platform.users where email = $1', [a.email]);
    expect(after.failed_login_attempts).toBe(0);
  });
});

describe('SEG-12 · sesión: 30 min de inactividad y 8 h de duración máxima', () => {
  it('una sesión con 29 min de inactividad sigue viva', async () => {
    const agent = await login(app, a.email);
    await owner(`update platform.sessions set last_activity_at = now() - interval '29 minutes' where id = $1`, [await lastSession(a.email)]);
    expect((await agent.get('/v1/auth/me')).status).toBe(200);
  });

  it('con 31 min de inactividad se cierra, y el refresh tampoco sirve', async () => {
    const agent = await login(app, a.email);
    const id = await lastSession(a.email);
    await owner(`update platform.sessions set last_activity_at = now() - interval '31 minutes' where id = $1`, [id]);
    const res = await agent.get('/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('SESSION_EXPIRED');
    expect((await owner<{ revoked_at: Date | null }>('select revoked_at from platform.sessions where id = $1', [id]))[0].revoked_at).not.toBeNull();
    expect((await agent.post('/v1/auth/refresh')).status).toBe(401);
  });

  it('pasadas las 8 h desde que se abrió, se cierra aunque haya actividad', async () => {
    const agent = await login(app, a.email);
    await owner(`update platform.sessions set expires_at = now() - interval '1 minute' where id = $1`, [await lastSession(a.email)]);
    const res = await agent.get('/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('SESSION_EXPIRED');
  });

  it('el token de acceso de una sesión cerrada ya no sirve', async () => {
    const res = await http().post('/v1/auth/login').send({ email: a.email, password: PASSWORD });
    const cookies = (res.headers['set-cookie'] as unknown as string[]).map((c) => c.split(';')[0]).join('; ');
    expect((await http().get('/v1/auth/me').set('Cookie', cookies)).status).toBe(200);
    expect((await http().post('/v1/auth/logout').set('Cookie', cookies)).status).toBe(204);
    expect((await http().get('/v1/auth/me').set('Cookie', cookies)).status).toBe(401);
  });
});

describe('SEG-23 · un usuario desactivado pierde el acceso (CC6.3)', () => {
  it('su sesión abierta deja de servir y no puede volver a entrar', async () => {
    const agent = await login(app, a.email);
    expect((await agent.get('/v1/services')).status).toBe(200);
    await owner(`update platform.users set status = 'inactive' where email = $1`, [a.email]);
    try {
      const res = await agent.get('/v1/services');
      expect([401, 403]).toContain(res.status);
      expect(['ACCOUNT_INACTIVE', 'SESSION_EXPIRED']).toContain(res.body.error.code);
      const again = await http().post('/v1/auth/login').send({ email: a.email, password: PASSWORD });
      expect(again.status).toBe(403);
      expect(again.body.error.code).toBe('ACCOUNT_INACTIVE');
    } finally {
      await owner(`update platform.users set status = 'active' where email = $1`, [a.email]);
    }
  });
});

describe('SEG-17 y SEG-18 · tokens guardados con HMAC y cookies seguras', () => {
  it('las cookies son httpOnly, SameSite=Lax, y el refresh solo viaja a /v1/auth', async () => {
    const res = await http().post('/v1/auth/login').send({ email: a.email, password: PASSWORD });
    const cookies = res.headers['set-cookie'] as unknown as string[];
    const access = cookies.find((c) => c.startsWith('mnk_access='));
    const refresh = cookies.find((c) => c.startsWith('mnk_refresh='));
    expect(access).toBeDefined();
    expect(refresh).toBeDefined();
    for (const c of [access!, refresh!]) {
      expect(c).toMatch(/HttpOnly/i);
      expect(c).toMatch(/SameSite=Lax/i);
    }
    expect(refresh).toMatch(/Path=\/v1\/auth/);
    expect(access).toMatch(/Path=\//);
    // Los tokens no viajan en el cuerpo: el frontend nunca los toca.
    expect(JSON.stringify(res.body).toLowerCase()).not.toMatch(/token|password|hash/);
  });

  it('el refresh token y la clave de acceso se guardan hasheados, nunca en claro', async () => {
    const res = await http().post('/v1/auth/login').send({ email: a.email, password: PASSWORD });
    const refreshToken = (res.headers['set-cookie'] as unknown as string[]).find((c) => c.startsWith('mnk_refresh='))!.split(';')[0].split('=')[1];
    const [session] = await owner<{ refresh_token_hash: string }>('select refresh_token_hash from platform.sessions where id = $1', [await lastSession(a.email)]);
    expect(session.refresh_token_hash).not.toBe(refreshToken);
    expect(session.refresh_token_hash).not.toContain(refreshToken);
    expect(session.refresh_token_hash.length).toBeGreaterThanOrEqual(43);

    const email = `hash-${RUN}@aislamiento.test`;
    const company = (await monkey.post('/v1/companies').send({ name: `Empresa hash ${RUN}`, requires_dedicated_database: false, admin_email: email, framework_codes: ['soc2'] })).body.data;
    const code: string = company.access_key.code;
    const [key] = await owner<{ code_hash: string }>('select code_hash from platform.access_keys where company_id = $1', [company.id]);
    expect(key.code_hash).not.toBe(code);
    expect(key.code_hash).not.toContain(code.replace(/-/g, ''));
    // El rastro de auditoría tampoco guarda la clave, ni en claro ni en hash.
    const trail = await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where action = 'company.register' and after_state::text like '%' || $1 || '%'`, [code.replace(/-/g, '')]);
    expect(trail[0].n).toBe(0);
  });
});

describe('SEG-24 · las credenciales de los sistemas del cliente nunca salen y se guardan cifradas', () => {
  it('ni la respuesta, ni el detalle, ni el listado las devuelven; en la base están cifradas', async () => {
    const secret = `S3cr3t-Plano-${RUN}!`;
    const created = await a.agent.post('/v1/assets').send({
      name: `aws-secreta-${RUN}`,
      connection_category: 'ac_01',
      platform: 'aws',
      connection_method: 'access_keys',
      external_account_id: '123456789012',
      regions: ['us-east-1'],
      service_ids: [a.serviceId],
      credentials: { access_key_id: 'AKIAIOSFODNN7EXAMPLE', secret_access_key: secret },
    });
    expect(created.status).toBe(201);
    const id = created.body.data.id as string;
    const detail = await a.agent.get(`/v1/assets/${id}`);
    const list = await a.agent.get('/v1/assets');
    for (const res of [created, detail, list]) {
      const text = JSON.stringify(res.body);
      expect(text).not.toContain(secret);
      expect(text.toLowerCase()).not.toMatch(/encrypted|secret_access_key/);
    }
    const [row] = await owner<{ encrypted_credentials: string }>('select encrypted_credentials from tenant.asset_provisionings where asset_id = $1', [id]);
    expect(row.encrypted_credentials).toMatch(/^v1\./);
    expect(row.encrypted_credentials).not.toContain(secret);
    expect(row.encrypted_credentials).not.toContain('AKIAIOSFODNN7EXAMPLE');
  });
});
