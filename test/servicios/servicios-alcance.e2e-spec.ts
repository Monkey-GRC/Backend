import type { INestApplication } from '@nestjs/common';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, servicePayload, Tenant } from '../support/escenario';
import { asignarControl, controlesDe } from '../support/asignaciones';
import { invitarYActivar, sembrarEquipo } from '../support/equipo';
import bcrypt from 'bcrypt';

// MD-193, D102 · Quién lee qué servicio (contracts/onboarding/contexto-servicio.md): `admin_empresa` y `auditor`, todos; `responsable` y `delegado`, solo los servicios donde son dueño o
// ejecutor de algún control. Un servicio de su empresa que no es suyo es 403; de otra empresa, 404; sin controles, lista vacía (200).
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let auditor: Agent;
let monkey: Agent;
let dueno: Awaited<ReturnType<typeof invitarYActivar>>;
let duenoSin: Awaited<ReturnType<typeof invitarYActivar>>;
let ejecutor: Awaited<ReturnType<typeof invitarYActivar>>;
let ejecutorSin: Awaited<ReturnType<typeof invitarYActivar>>;
let servicio2: string;

const ids = async (agent: Agent) => (await agent.get('/v1/services?page_size=100').expect(200)).body.data.items.map((s: { id: string }) => s.id) as string[];

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  await owner(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, 'auditor'::platform.user_role)`,
    [a.companyId, `auditor-svc-${RUN}@cumplimiento.test`, await bcrypt.hash(PASSWORD, 4)],
  );
  auditor = await login(app, `auditor-svc-${RUN}@cumplimiento.test`);
  const person = { name: 'Persona', last_name: 'De Prueba' };
  dueno = await invitarYActivar(app, a.agent, { email: `dueno-svc-${RUN}@cumplimiento.test`, role: 'responsable', ...person });
  duenoSin = await invitarYActivar(app, a.agent, { email: `dueno2-svc-${RUN}@cumplimiento.test`, role: 'responsable', ...person });
  const equipo = await sembrarEquipo(a.companyId, dueno.id);
  ejecutor = await invitarYActivar(app, a.agent, { email: `ejecutor-svc-${RUN}@cumplimiento.test`, role: 'delegado', group_id: equipo, is_internal: true, ...person });
  ejecutorSin = await invitarYActivar(app, a.agent, { email: `ejecutor2-svc-${RUN}@cumplimiento.test`, role: 'delegado', group_id: equipo, is_internal: true, ...person });
  servicio2 = (await a.agent.post('/v1/services').send(servicePayload(`Segundo servicio ${RUN}`)).expect(201)).body.data.id;
  // El dueño tiene un control del primer servicio; el ejecutor, uno del segundo.
  await asignarControl(a.companyId, (await controlesDe(a.serviceId))[0], dueno.id);
  await asignarControl(a.companyId, (await controlesDe(servicio2))[0], dueno.id, ejecutor.id);
});
afterAll(async () => {
  await app?.close();
});

describe('Quién lee los servicios (D102)', () => {
  it('el administrador y el auditor listan todos', async () => {
    for (const agent of [a.agent, auditor]) expect(await ids(agent)).toEqual(expect.arrayContaining([a.serviceId, servicio2]));
  });

  it('el dueño lista los servicios donde tiene un control; el ejecutor, solo donde ejecuta', async () => {
    expect((await ids(dueno.session)).sort()).toEqual([a.serviceId, servicio2].sort());
    expect(await ids(ejecutor.session)).toEqual([servicio2]);
  });

  it('quien no tiene controles recibe la lista vacía (200), no un error', async () => {
    for (const agent of [duenoSin.session, ejecutorSin.session]) {
      const res = await agent.get('/v1/services').expect(200);
      expect(res.body.data).toMatchObject({ items: [], total: 0 });
    }
  });

  it('el detalle de uno suyo es 200; el de otro servicio de su empresa, 403; el de otra empresa, 404', async () => {
    await dueno.session.get(`/v1/services/${a.serviceId}`).expect(200);
    await ejecutor.session.get(`/v1/services/${servicio2}`).expect(200);
    const res = await ejecutor.session.get(`/v1/services/${a.serviceId}`).expect(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    for (const agent of [duenoSin.session, ejecutorSin.session]) {
      await agent.get(`/v1/services/${a.serviceId}`).expect(403);
      await agent.get(`/v1/services/${servicio2}`).expect(403);
    }
    for (const agent of [dueno.session, ejecutor.session, ejecutorSin.session]) await agent.get(`/v1/services/${b.serviceId}`).expect(404);
  });

  it('un control que se retira saca el servicio de la lista del ejecutor', async () => {
    const [control] = await controlesDe(servicio2);
    await owner(`update tenant.client_controls set is_active = false where id = $1`, [control]);
    try {
      expect(await ids(ejecutor.session)).toEqual([]);
    } finally {
      await owner(`update tenant.client_controls set is_active = true where id = $1`, [control]);
    }
    expect(await ids(ejecutor.session)).toEqual([servicio2]);
  });

  it('crear, editar y borrar un servicio siguen siendo solo del administrador: 403 para responsable, delegado y auditor', async () => {
    for (const agent of [dueno.session, ejecutor.session, auditor]) {
      await agent.post('/v1/services').send(servicePayload(`No ${RUN}`)).expect(403);
      await agent.patch(`/v1/services/${a.serviceId}`).send({ name: 'x' }).expect(403);
      await agent.delete(`/v1/services/${a.serviceId}`).expect(403);
    }
  });

  it('admin_monkey no entra al cumplimiento de una empresa', async () => {
    await monkey.get('/v1/services').expect(403);
  });
});
