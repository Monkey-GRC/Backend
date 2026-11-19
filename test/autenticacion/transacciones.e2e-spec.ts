import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Agent, bootApp, login, owner, RUN } from '../support/app';
import { dosEmpresas, empresaConCupo, orgPayload, Tenant } from '../support/escenario';
import { invitarYActivar } from '../support/equipo';
import { AccessTokenService } from '../../src/features/auth/domain/ports/access-token.service';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';

// MD-219 · Transacciones por petición: validar la sesión cuesta una (sesión + persona con un JOIN) y GET /auth/me suma una más (perfil + onboarding).
let app: INestApplication;
let a: Tenant;
let monkey: Agent;
let b: Tenant;

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});

const conteo = async (llamada: () => PromiseLike<unknown>): Promise<number> => {
  const spy = jest.spyOn(app.get(PrismaService), 'withScope');
  try {
    await llamada();
    return spy.mock.calls.length;
  } finally {
    spy.mockRestore();
  }
};

describe('transacciones por petición (MD-219)', () => {
  it('validar la sesión de una ruta autenticada es un solo withScope', async () => {
    // Idioma inválido: el guard valida la sesión y la validación del cuerpo corta antes del caso de uso.
    const n = await conteo(() => a.agent.patch('/v1/auth/me/language').send({ language: 'fr' }).expect(422));
    expect(n).toBe(1);
  });

  it('GET /auth/me de admin_empresa: 2 (guard + perfil con onboarding)', async () => {
    const res = await a.agent.get('/v1/auth/me').expect(200);
    expect(res.body.data.onboarding).toBeDefined();
    expect(await conteo(() => a.agent.get('/v1/auth/me').expect(200))).toBe(2);
  });

  it('GET /auth/me de otro rol: 2 (guard + perfil)', async () => {
    expect(await conteo(() => monkey.get('/v1/auth/me').expect(200))).toBe(2);
  });
});

const idDe = async (email: string) => (await owner<{ id: string }>('select id from platform.users where email = $1', [email]))[0].id;
const sesionDe = async (email: string) =>
  (await owner<{ id: string }>('select s.id from platform.sessions s join platform.users u on u.id = s.user_id where u.email = $1 and s.revoked_at is null order by s.created_at desc limit 1', [email]))[0].id;
const actividad = async (sid: string) => (await owner<{ t: Date }>('select last_activity_at as t from platform.sessions where id = $1', [sid]))[0].t.getTime();

describe('GET /auth/me: forma y onboarding (MD-219)', () => {
  it('admin_empresa sin organización: next_step organizational_context y ningún paso hecho', async () => {
    const e = await empresaConCupo(app, monkey, 'ME1', 10);
    const body = (await e.agent.get('/v1/auth/me').expect(200)).body.data;
    expect(body.onboarding).toEqual({ next_step: 'organizational_context', completed_steps: [] });
    expect(body.company).toEqual({ id: e.companyId, name: `Empresa ME1 ${RUN}` });
    expect(body.user).toMatchObject({ email: e.email, role: 'admin_empresa', status: 'active', is_mfa_enabled: false, group: null, preferred_language: 'es' });
    expect(Object.keys(body.user)).toEqual(expect.arrayContaining(['id', 'email', 'name', 'last_name', 'role', 'status', 'is_mfa_enabled', 'last_login_at', 'created_at', 'group', 'preferred_language']));
    expect(body.user).not.toHaveProperty('responsible');
  });

  it('con organización, servicio y activos: los pasos salen en orden', async () => {
    const body = (await a.agent.get('/v1/auth/me').expect(200)).body.data;
    expect(body.company).toEqual({ id: a.companyId, name: a.companyName });
    expect(body.onboarding.completed_steps).toEqual(expect.arrayContaining(['organizational_context', 'service_context']));
    expect(body.onboarding.completed_steps.slice(0, 2)).toEqual(['organizational_context', 'service_context']);
    const esperado = body.onboarding.completed_steps.length === 3 ? null : 'technical_control';
    expect(body.onboarding.next_step).toBe(esperado);
  });

  it('con solo la organización: completed [organizational_context] y sigue service_context', async () => {
    const e = await empresaConCupo(app, monkey, 'ME2', 10);
    await e.agent.put('/v1/onboarding/organizational-context').send(orgPayload).expect(200);
    const body = (await e.agent.get('/v1/auth/me').expect(200)).body.data;
    expect(body.onboarding).toEqual({ next_step: 'service_context', completed_steps: ['organizational_context'] });
  });

  it('un responsable y un auditor: la clave onboarding no viaja', async () => {
    const e = await empresaConCupo(app, monkey, 'ME3', 10);
    const resp = await invitarYActivar(app, e.agent, { email: `resp-me3-${RUN}@cupo.test`, name: 'R', last_name: 'R', role: 'responsable' });
    const aud = await invitarYActivar(app, e.agent, { email: `aud-me3-${RUN}@cupo.test`, name: 'A', last_name: 'A', role: 'auditor' });
    for (const p of [resp, aud]) {
      const body = (await p.session.get('/v1/auth/me').expect(200)).body.data;
      expect(body).not.toHaveProperty('onboarding');
      expect(body.company.id).toBe(e.companyId);
    }
  });
});

describe('el rol sale de la base en cada petición (MD-219)', () => {
  it('cambiar el rol con la sesión viva se refleja en la siguiente petición', async () => {
    const e = await empresaConCupo(app, monkey, 'ROL', 10);
    expect((await e.agent.get('/v1/auth/me').expect(200)).body.data.user.role).toBe('admin_empresa');
    await owner(`update platform.users set role = 'auditor' where email = $1`, [e.email]);
    const body = (await e.agent.get('/v1/auth/me').expect(200)).body.data;
    expect(body.user.role).toBe('auditor');
    expect(body).not.toHaveProperty('onboarding');
    await e.agent.get('/v1/users').expect(403);
  });
});

describe('aislamiento de la sesión con la base real (MD-219)', () => {
  const conToken = async (claims: { sub: string; cid: string; sid: string }) => {
    const token = await app.get(AccessTokenService).sign({ ...claims, role: 'admin_empresa' });
    return request(app.getHttpServer()).get('/v1/auth/me').set('Cookie', `mnk_access=${token}`);
  };

  it('cid propio con el sid de una sesión de OTRA empresa: 401 UNAUTHENTICATED', async () => {
    const res = await conToken({ sub: await idDe(a.email), cid: a.companyId, sid: await sesionDe(b.email) });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('el sid de otra persona de la misma empresa: 401 UNAUTHENTICATED', async () => {
    const otra = await invitarYActivar(app, a.agent, { email: `otra-iso-${RUN}@cupo.test`, name: 'O', last_name: 'O', role: 'admin_empresa' });
    const res = await conToken({ sub: await idDe(a.email), cid: a.companyId, sid: await sesionDe(otra.data.email) });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('sanidad: el token con su propia sesión sí entra', async () => {
    expect((await conToken({ sub: await idDe(a.email), cid: a.companyId, sid: await sesionDe(a.email) })).status).toBe(200);
  });
});

describe('last_activity_at: el touch (MD-219)', () => {
  it('dentro del minuto no cambia; pasado el minuto sí', async () => {
    const agent = await login(app, a.email);
    const sid = await sesionDe(a.email);
    const inicial = await actividad(sid);
    await agent.get('/v1/auth/me').expect(200);
    expect(await actividad(sid)).toBe(inicial);
    await owner(`update platform.sessions set last_activity_at = now() - interval '2 minutes' where id = $1`, [sid]);
    const viejo = await actividad(sid);
    await agent.get('/v1/auth/me').expect(200);
    expect(await actividad(sid)).toBeGreaterThan(viejo + 60_000);
  });

  it('una sesión vencida por inactividad no se toca y responde SESSION_EXPIRED', async () => {
    const agent = await login(app, a.email);
    const sid = await sesionDe(a.email);
    await owner(`update platform.sessions set last_activity_at = now() - interval '31 minutes' where id = $1`, [sid]);
    const viejo = await actividad(sid);
    const res = await agent.get('/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('SESSION_EXPIRED');
    expect(await actividad(sid)).toBe(viejo);
  });
});
