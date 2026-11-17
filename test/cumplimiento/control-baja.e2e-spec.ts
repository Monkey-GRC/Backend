import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { FileStorage } from '../../src/common/storage/file-storage';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-193 · Un control dado de baja deja de verse (404), pero su historial (evidencia, veredictos, observaciones) se sigue leyendo; las subidas dan CONTROL_RETIRED. El alcance dueño/ejecutor sigue aplicando.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let auditor: Agent;
let control: string;
let otro: string;
let testId: string;
let requirement: string;
let submission: string;
let observation: string;
const storage = new StorageEnMemoria();
const pdf = Buffer.from(`%PDF-1.7\n% baja ${RUN}\n`);

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  ({ a } = await dosEmpresas(app));
  await owner(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, 'auditor'::platform.user_role)`,
    [a.companyId, `auditor-baja-${RUN}@cumplimiento.test`, await bcrypt.hash(PASSWORD, 4)],
  );
  auditor = await login(app, `auditor-baja-${RUN}@cumplimiento.test`);
  const controls = await owner<{ id: string; test_id: string }>(
    `select cc.id, (select x.test_id from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = cc.id and t.dimension = 'policy' order by t.code limit 1) test_id
       from tenant.client_controls cc
      where cc.service_id = $1 and cc.is_active
        and exists (select 1 from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = cc.id and t.dimension = 'policy')
      order by cc.own_code limit 2`,
    [a.serviceId],
  );
  [control, otro] = controls.map((c) => c.id);
  testId = controls[0].test_id;
  submission = (await a.agent.post(`/v1/controls/${control}/tests/${testId}/evidence`).attach('file', pdf, 'baja.pdf').expect(201)).body.data.id;
  requirement = (await a.agent.get(`/v1/controls/${control}/evidence`).expect(200)).body.data.items.find((r: any) => r.test?.id === testId).id;
  observation = (await auditor.post(`/v1/services/${a.serviceId}/observations`).send({ type: 'observation', body: 'Falta evidencia.', client_control_id: control }).expect(201)).body.data.id;
});
afterAll(async () => {
  await app?.close();
});

describe('Lo que cuelga de un control dado de baja', () => {
  const lecturas = () => [
    `/v1/controls/${control}/evidence`,
    `/v1/controls/${control}/tests/${testId}/evidence`,
    `/v1/evidence-requirements/${requirement}/submissions`,
    `/v1/evidence-submissions/${submission}/download`,
    `/v1/controls/${control}/tests/${testId}/verdicts`,
    `/v1/services/${a.serviceId}/observations?client_control_id=${control}`,
    `/v1/observations/${observation}`,
  ];

  it('vigente, todo se lee', async () => {
    await a.agent.get(`/v1/controls/${control}`).expect(200);
    for (const path of lecturas()) for (const agent of [a.agent, auditor]) await agent.get(path).expect(200);
  });

  it('dado de baja: el control da 404, el historial se sigue leyendo (200), las subidas dan CONTROL_RETIRED y la evidencia del servicio lo omite', async () => {
    await a.agent.delete(`/v1/controls/${control}`).expect(204);
    await a.agent.get(`/v1/controls/${control}`).expect(404);
    await a.agent.get(`/v1/controls/${control}/tests`).expect(404);
    for (const path of lecturas()) for (const agent of [a.agent, auditor]) await agent.get(path).expect(200);
    const res = await a.agent.post(`/v1/controls/${control}/tests/${testId}/evidence`).attach('file', Buffer.from(`%PDF-1.7\n% otra ${RUN}\n`), 'otra.pdf');
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONTROL_RETIRED');
    const servicio = (await a.agent.get(`/v1/services/${a.serviceId}/evidence`).expect(200)).body.data.items as Array<{ control_id: string }>;
    expect(servicio.some((i) => i.control_id === control)).toBe(false);
    await a.agent.get(`/v1/controls/${otro}/evidence`).expect(200);
  });
});
