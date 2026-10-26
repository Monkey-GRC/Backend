import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootApp } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// Aislamiento entre empresas A TRAVÉS DE LA API (MD-147, DT-20): un usuario autenticado de la empresa A no puede
// ver, tocar ni enlazar nada de la empresa B. La API real, con el rol real de la base (monkey_app, bajo RLS).
// Regla de respuesta: lo ajeno "no existe" → 404 (nunca 200, nunca 403 que confirme que el recurso existe).
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Awaited<ReturnType<typeof dosEmpresas>>['monkey'];

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});

const sinFuga = (res: request.Response) => {
  const texto = JSON.stringify(res.body);
  for (const secreto of [b.companyId, b.serviceId, b.assetId, b.serviceName, b.assetName, b.companyName, b.email]) {
    expect(texto).not.toContain(secreto);
  }
};

describe('Control positivo: cada empresa sí accede a lo suyo', () => {
  it.each([['A'], ['B']])('la empresa %s lee su servicio y su activo', async (k) => {
    const t = k === 'A' ? a : b;
    expect((await t.agent.get(`/v1/services/${t.serviceId}`)).status).toBe(200);
    expect((await t.agent.get(`/v1/assets/${t.assetId}`)).status).toBe(200);
  });
});

describe('A no puede leer lo de B', () => {
  it('GET /services/:id de B → 404', async () => {
    const res = await a.agent.get(`/v1/services/${b.serviceId}`);
    expect(res.status).toBe(404);
    sinFuga(res);
  });

  it('GET /assets/:id de B → 404', async () => {
    const res = await a.agent.get(`/v1/assets/${b.assetId}`);
    expect(res.status).toBe(404);
    sinFuga(res);
  });

  it('GET /services/:id/technical-control de B → 404', async () => {
    const res = await a.agent.get(`/v1/services/${b.serviceId}/technical-control`);
    expect(res.status).toBe(404);
    sinFuga(res);
  });

  it('los listados solo traen lo propio', async () => {
    const servicios = await a.agent.get('/v1/services');
    expect(servicios.status).toBe(200);
    expect(JSON.stringify(servicios.body)).toContain(a.serviceId);
    sinFuga(servicios);
    const activos = await a.agent.get('/v1/assets');
    expect(activos.status).toBe(200);
    expect(JSON.stringify(activos.body)).toContain(a.assetId);
    sinFuga(activos);
  });

  it('filtrar activos por el servicio de B no devuelve nada de B', async () => {
    const res = await a.agent.get(`/v1/assets?service_id=${b.serviceId}`);
    expect([200, 404]).toContain(res.status);
    sinFuga(res);
  });

  it('el contexto organizacional que ve A es el de A', async () => {
    const res = await a.agent.get('/v1/onboarding/organizational-context');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(a.companyName);
    sinFuga(res);
  });
});

describe('A no puede modificar lo de B', () => {
  it('PATCH y DELETE de un servicio de B → 404, y B conserva el suyo intacto', async () => {
    const patch = await a.agent.patch(`/v1/services/${b.serviceId}`).send({ name: 'Hackeado' });
    expect(patch.status).toBe(404);
    const del = await a.agent.delete(`/v1/services/${b.serviceId}`);
    expect(del.status).toBe(404);
    const aunEsta = await b.agent.get(`/v1/services/${b.serviceId}`);
    expect(aunEsta.status).toBe(200);
    expect(aunEsta.body.data.name).toBe(b.serviceName);
  });

  it('validar, activar y programar un activo de B → 404', async () => {
    expect((await a.agent.post(`/v1/assets/${b.assetId}/validate`)).status).toBe(404);
    expect((await a.agent.post(`/v1/assets/${b.assetId}/activate`)).status).toBe(404);
    expect((await a.agent.put(`/v1/assets/${b.assetId}/schedule`).send({ frequency: 'continuous' })).status).toBe(404);
  });

  it('no se puede registrar un activo propio enlazado al servicio de B', async () => {
    const res = await a.agent.post('/v1/assets').send({
      name: `intruso-${Date.now()}`,
      connection_category: 'ac_01',
      platform: 'aws',
      connection_method: 'readonly_role',
      external_account_id: '123456789012',
      regions: ['us-east-1'],
      service_ids: [b.serviceId],
    });
    expect(res.status).not.toBe(201);
    expect(res.status).toBeLessThan(500);
    const enB = await b.agent.get(`/v1/assets?service_id=${b.serviceId}`);
    expect(JSON.stringify(enB.body)).not.toContain('intruso-');
  });
});

describe('Lo que es solo de Monkey Admin', () => {
  it('una empresa no puede listar ni ver empresas', async () => {
    expect((await a.agent.get('/v1/companies')).status).toBe(403);
    expect((await a.agent.get(`/v1/companies/${b.companyId}`)).status).toBe(403);
  });

  it('una empresa no puede registrar otra', async () => {
    const res = await a.agent
      .post('/v1/companies')
      .send({ name: `Colada ${Date.now()}`, requires_dedicated_database: false, admin_email: `colada-${Date.now()}@x.test`, framework_codes: ['soc2'] });
    expect(res.status).toBe(403);
  });

  it('admin_monkey sí ve a las dos empresas', async () => {
    const res = await monkey.get('/v1/companies');
    expect(res.status).toBe(200);
    const texto = JSON.stringify(res.body);
    expect(texto).toContain(a.companyId);
    expect(texto).toContain(b.companyId);
  });

  it('admin_monkey no actúa como admin_empresa: no declara servicios', async () => {
    expect((await monkey.get('/v1/services')).status).toBe(403);
  });
});

describe('Sin sesión válida no hay datos', () => {
  it('sin cookie → 401', async () => {
    const anon = request(app.getHttpServer());
    expect((await anon.get('/v1/services')).status).toBe(401);
    expect((await anon.get(`/v1/assets/${a.assetId}`)).status).toBe(401);
    expect((await anon.get('/v1/auth/me')).status).toBe(401);
  });

  it('con una cookie manipulada → 401', async () => {
    const res = await request(app.getHttpServer()).get('/v1/services').set('Cookie', 'mnk_access=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.firma-falsa');
    expect(res.status).toBe(401);
  });

  it('tras cerrar sesión, el refresh ya no sirve', async () => {
    const otro = request.agent(app.getHttpServer());
    const entrada = await otro.post('/v1/auth/login').send({ email: a.email, password: 'UnaClaveLarga123!' });
    expect(entrada.status).toBe(200);
    expect((await otro.post('/v1/auth/logout')).status).toBe(204);
    expect((await otro.post('/v1/auth/refresh')).status).toBe(401);
  });
});
