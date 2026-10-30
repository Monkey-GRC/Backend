import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { claveEnviadaA } from '../support/correo-en-memoria';
import { dosEmpresas, servicePayload, Tenant } from '../support/escenario';

// SEG-36 (D41, DT-28): la auditoría se escribe en la MISMA transacción que la acción. Estas pruebas lo demuestran de
// las dos formas: (1) cada acción deja exactamente un rastro; (2) si el rastro falla —incluso DESPUÉS de insertarse—,
// la acción entera se revierte y tampoco queda la fila de auditoría.
let app: INestApplication;
let a: Tenant;
let monkey: Awaited<ReturnType<typeof dosEmpresas>>['monkey'];
const realInsert = auditInsert.insertAuditLog;

beforeAll(async () => {
  app = await bootApp();
  ({ a, monkey } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});
afterEach(() => jest.restoreAllMocks());

/** El próximo rastro se inserta de verdad y LUEGO falla: obliga a la transacción a deshacerlo todo. */
const auditFailsAfterInsert = () =>
  jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
    await realInsert(db, entry);
    throw new Error('audit_down');
  });

const auditRows = (tenantId: string, action: string) =>
  owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [tenantId, action]).then((r) => r[0].n);

describe('Cada acción deja exactamente un rastro, con su empresa', () => {
  it.each([
    ['organizational_context.save'],
    ['service.create'],
    ['asset.create'],
    ['access_key.redeem'],
    ['user.create'],
  ])('%s', async (action) => {
    expect(await auditRows(a.companyId, action)).toBe(1);
  });

  it('company.register (acción de plataforma, sin tenant) apunta a la empresa en su estado posterior', async () => {
    const r = await owner<{ n: number }>(
      `select count(*)::int n from audit.audit_logs where tenant_id is null and action = 'company.register' and after_state->>'company_id' = $1`,
      [a.companyId],
    );
    expect(r[0].n).toBe(1);
  });

  it('el rastro del servicio trae su estado antes y después (CC9.2)', async () => {
    const upd = await a.agent.patch(`/v1/services/${a.serviceId}`).send({ description: `Descripción nueva ${RUN}` });
    expect(upd.status).toBe(200);
    const [row] = await owner<{ before_state: { description: string }; after_state: { description: string } }>(
      `select before_state, after_state from audit.audit_logs where tenant_id = $1 and action = 'service.update' order by created_at desc limit 1`,
      [a.companyId],
    );
    expect(row.before_state.description).not.toBe(row.after_state.description);
    expect(row.after_state.description).toBe(`Descripción nueva ${RUN}`);
  });
});

describe('Si el rastro falla, la acción se revierte (y el rastro también)', () => {
  it('crear un servicio', async () => {
    const before = await auditRows(a.companyId, 'service.create');
    auditFailsAfterInsert();
    const name = `Servicio fallido ${RUN}`;
    const res = await a.agent.post('/v1/services').send(servicePayload(name));
    expect(res.status).toBe(500);
    expect(JSON.stringify((await a.agent.get('/v1/services')).body)).not.toContain(name);
    expect(await auditRows(a.companyId, 'service.create')).toBe(before);
  });

  it('modificar un servicio', async () => {
    const before = await auditRows(a.companyId, 'service.update');
    auditFailsAfterInsert();
    const res = await a.agent.patch(`/v1/services/${a.serviceId}`).send({ name: `Renombrado ${RUN}` });
    expect(res.status).toBe(500);
    expect((await a.agent.get(`/v1/services/${a.serviceId}`)).body.data.name).toBe(a.serviceName);
    expect(await auditRows(a.companyId, 'service.update')).toBe(before);
  });

  it('guardar la Descripción del Sistema', async () => {
    const original = (await a.agent.get(`/v1/services/${a.serviceId}`)).body.data.system_description?.url;
    auditFailsAfterInsert();
    const res = await a.agent.post(`/v1/services/${a.serviceId}/system-description`).send({ kind: 'link', url: 'https://docs.ejemplo.com/otro.pdf' });
    expect(res.status).toBe(500);
    expect((await a.agent.get(`/v1/services/${a.serviceId}`)).body.data.system_description?.url).toBe(original);
  });

  it('eliminar un servicio', async () => {
    const created = await a.agent.post('/v1/services').send(servicePayload(`Servicio a borrar ${RUN}`));
    expect(created.status).toBe(201);
    const id = created.body.data.id as string;
    const before = await auditRows(a.companyId, 'service.delete');
    auditFailsAfterInsert();
    expect((await a.agent.delete(`/v1/services/${id}`)).status).toBe(500);
    expect((await a.agent.get(`/v1/services/${id}`)).status).toBe(200);
    expect(await auditRows(a.companyId, 'service.delete')).toBe(before);
  });

  it('guardar el contexto organizacional', async () => {
    const original = (await a.agent.get('/v1/onboarding/organizational-context')).body.data;
    auditFailsAfterInsert();
    const res = await a.agent.put('/v1/onboarding/organizational-context').send({
      description: `Cambio que no debe quedar ${RUN}`,
      size: original.size,
      industry: original.industry,
      business_model: original.business_model,
      years_in_operation: original.years_in_operation,
      incorporation_countries: original.incorporation_countries,
      client_countries: original.client_countries,
      compliance_maturity: original.compliance_maturity,
      regulation_codes: original.regulations.map((r: { code: string }) => r.code),
    });
    expect(res.status).toBe(500);
    expect((await a.agent.get('/v1/onboarding/organizational-context')).body.data.description).toBe(original.description);
  });

  it('registrar, validar, activar y programar un activo', async () => {
    const total = async () => (await a.agent.get('/v1/assets')).body.data.total as number;
    const assetBody = {
      name: `aws-fallido-${RUN}`,
      connection_category: 'ac_01',
      platform: 'aws',
      connection_method: 'readonly_role',
      external_account_id: '123456789012',
      regions: ['us-east-1'],
      service_ids: [a.serviceId],
    };
    const count = await total();
    auditFailsAfterInsert();
    expect((await a.agent.post('/v1/assets').send(assetBody)).status).toBe(500);
    expect(await total()).toBe(count);

    const snapshot = async () => JSON.stringify((await a.agent.get(`/v1/assets/${a.assetId}`)).body.data);
    const original = await snapshot();
    auditFailsAfterInsert();
    expect((await a.agent.post(`/v1/assets/${a.assetId}/validate`)).status).toBe(500);
    expect(await snapshot()).toBe(original);

    // Para probar activar y programar hace falta un activo que sí llegue a validarse, sin fallos.
    expect((await a.agent.post(`/v1/assets/${a.assetId}/validate`)).status).toBe(200);
    const validated = await snapshot();
    auditFailsAfterInsert();
    expect((await a.agent.post(`/v1/assets/${a.assetId}/activate`)).status).toBe(500);
    expect(await snapshot()).toBe(validated);
    expect((await a.agent.post(`/v1/assets/${a.assetId}/activate`)).status).toBe(200);
    const activated = await snapshot();
    auditFailsAfterInsert();
    expect((await a.agent.put(`/v1/assets/${a.assetId}/schedule`).send({ frequency: 'every_6h' })).status).toBe(500);
    expect(await snapshot()).toBe(activated);
  });

  it('abrir una sesión (login): no queda sesión sin rastro', async () => {
    const sessions = () => owner<{ n: number }>('select count(*)::int n from platform.sessions s join platform.users u on u.id = s.user_id where u.email = $1', [a.email]).then((r) => r[0].n);
    const before = await sessions();
    auditFailsAfterInsert();
    const res = await request(app.getHttpServer()).post('/v1/auth/login').send({ email: a.email, password: PASSWORD });
    expect(res.status).toBe(500);
    expect(res.headers['set-cookie']).toBeUndefined();
    expect(await sessions()).toBe(before);
  });

  it('cerrar sesión (logout): la sesión sigue viva si el rastro falla', async () => {
    const agent = await login(app, a.email);
    expect((await agent.get('/v1/auth/me')).status).toBe(200);
    auditFailsAfterInsert();
    expect((await agent.post('/v1/auth/logout')).status).toBe(500);
    expect((await agent.get('/v1/auth/me')).status).toBe(200);
    expect((await agent.post('/v1/auth/logout')).status).toBe(204);
    expect((await agent.get('/v1/auth/me')).status).toBe(401);
  });

  it('registrar una empresa: no queda empresa sin rastro', async () => {
    const name = `Empresa fallida ${RUN}`;
    auditFailsAfterInsert();
    const res = await monkey.post('/v1/companies').send({ name, requires_dedicated_database: false, admin_email: `fallida-${RUN}@aislamiento.test`, framework_codes: ['soc2'] });
    expect(res.status).toBe(500);
    expect((await owner('select 1 from platform.companies where name = $1', [name])).length).toBe(0);
  });

  it('canjear la clave: la clave sigue pendiente y no nace la cuenta', async () => {
    const email = `canje-${RUN}@aislamiento.test`;
    const company = (await monkey.post('/v1/companies').send({ name: `Empresa canje ${RUN}`, requires_dedicated_database: false, admin_email: email, framework_codes: ['soc2'] })).body.data;
    auditFailsAfterInsert();
    const res = await request(app.getHttpServer()).post('/v1/auth/redeem').send({ code: claveEnviadaA(email), email, password: PASSWORD });
    expect(res.status).toBe(500);
    expect((await owner<{ status: string }>('select status from platform.access_keys where company_id = $1', [company.id]))[0].status).toBe('pending');
    expect((await owner('select 1 from platform.users where email = $1', [email])).length).toBe(0);
    // Y el canje sigue funcionando después: nada quedó a medias.
    expect((await request(app.getHttpServer()).post('/v1/auth/redeem').send({ code: claveEnviadaA(email), email, password: PASSWORD })).status).toBe(201);
  });
});
