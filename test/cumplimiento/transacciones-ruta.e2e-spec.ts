import type { INestApplication } from '@nestjs/common';
import { FileStorage } from '../../src/common/storage/file-storage';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { bootApp, owner, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';
import { invitarYActivar } from '../support/equipo';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-230 · Transacciones por petición: cada ruta abre 1 transacción (el caso de uso: la validación de sesión del guard ya no abre ninguna, MD-529).
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let resp: Awaited<ReturnType<typeof invitarYActivar>>;
const NO_EXISTE = '00000000-0000-4000-8000-000000000000';
let controlId: string;
let requirementId: string;
const pdf = Buffer.from(`%PDF-1.7\n% tx ${RUN}\n`);

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(new StorageEnMemoria()));
  ({ a, b } = await dosEmpresas(app));
  resp = await invitarYActivar(app, a.agent, { email: `resp-tx-${RUN}@cupo.test`, name: 'R', last_name: 'R', role: 'responsable' });
  const rows = await owner<{ id: string; test_id: string }>(
    `select cc.id, (select x.test_id from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = cc.id and t.dimension = 'policy' order by t.code limit 1) test_id
       from tenant.client_controls cc
      where cc.service_id = $1 and cc.is_active
        and exists (select 1 from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = cc.id and t.dimension = 'policy')
      order by cc.own_code limit 1`,
    [a.serviceId],
  );
  controlId = rows[0].id;
  await a.agent.post(`/v1/controls/${controlId}/tests/${rows[0].test_id}/evidence`).attach('file', pdf, 'tx.pdf').expect(201);
  requirementId = (await a.agent.get(`/v1/controls/${controlId}/evidence`).expect(200)).body.data.items.find((r: any) => r.test?.id === rows[0].test_id).id;
});
afterAll(async () => {
  await app?.close();
});

const conteo = async (llamada: () => PromiseLike<unknown>): Promise<number> => {
  const spy = jest.spyOn(app.get(PrismaService), '$transaction');
  try {
    await llamada();
    return spy.mock.calls.length;
  } finally {
    spy.mockRestore();
  }
};

describe('withScope por ruta (MD-230)', () => {
  it('PATCH /controls/:id', async () => {
    expect(await conteo(() => a.agent.patch(`/v1/controls/${controlId}`).send({ interpretation: { text: 'Nuestra forma de cumplirlo.' } }).expect(200))).toBe(1);
  });
  it('GET /controls/:id/tests', async () => {
    expect(await conteo(() => a.agent.get(`/v1/controls/${controlId}/tests`).expect(200))).toBe(1);
  });
  it('GET /evidence-requirements/:id/submissions', async () => {
    expect(await conteo(() => a.agent.get(`/v1/evidence-requirements/${requirementId}/submissions`).expect(200))).toBe(1);
  });
  it('GET /services/:id de admin_empresa', async () => {
    expect(await conteo(() => a.agent.get(`/v1/services/${a.serviceId}`).expect(200))).toBe(1);
  });
  it('GET /services/:id de un responsable (comprueba si le toca)', async () => {
    expect(await conteo(() => resp.session.get(`/v1/services/${a.serviceId}`).expect(403))).toBe(1);
  });
});

// Los códigos de error siguen igual con la transacción única de caso de uso.
describe('errores por ruta con una sola transacción (MD-230)', () => {
  it('PATCH /controls/:id: inexistente 404, de otra empresa 404, responsable 403, cuerpo inválido 422', async () => {
    const body = { interpretation: { text: 'x' } };
    await a.agent.patch(`/v1/controls/${NO_EXISTE}`).send(body).expect(404);
    await b.agent.patch(`/v1/controls/${controlId}`).send(body).expect(404);
    await resp.session.patch(`/v1/controls/${controlId}`).send(body).expect(403);
    await a.agent.patch(`/v1/controls/${controlId}`).send({}).expect(422);
  });
  it('PATCH /controls/:id: un control dado de baja es 409 CONTROL_RETIRED y no cambia nada', async () => {
    const own = (await a.agent.post(`/v1/services/${a.serviceId}/controls`).send({ name: 'Para baja', interpretation: 'Se revisa cada trimestre.', trust_criterion: 'security' }).expect(201)).body.data.id;
    await a.agent.delete(`/v1/controls/${own}`).expect(204);
    const res = await a.agent.patch(`/v1/controls/${own}`).send({ interpretation: { text: 'x' } });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONTROL_RETIRED');
  });
  it('GET /controls/:id/tests: inexistente 404, de otra empresa 404, responsable 403', async () => {
    await a.agent.get(`/v1/controls/${NO_EXISTE}/tests`).expect(404);
    await b.agent.get(`/v1/controls/${controlId}/tests`).expect(404);
    await resp.session.get(`/v1/controls/${controlId}/tests`).expect(403);
  });
  it('GET /evidence-requirements/:id/submissions: inexistente 404, de otra empresa 404, responsable sin alcance 403', async () => {
    await a.agent.get(`/v1/evidence-requirements/${NO_EXISTE}/submissions`).expect(404);
    await b.agent.get(`/v1/evidence-requirements/${requirementId}/submissions`).expect(404);
    await resp.session.get(`/v1/evidence-requirements/${requirementId}/submissions`).expect(403);
  });
  it('GET /services/:id: inexistente 404, de otra empresa 404, responsable que no es dueño 403', async () => {
    await a.agent.get(`/v1/services/${NO_EXISTE}`).expect(404);
    await b.agent.get(`/v1/services/${a.serviceId}`).expect(404);
    await resp.session.get(`/v1/services/${a.serviceId}`).expect(403);
  });
});
