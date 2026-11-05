import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-133 · Cargos responsables de la organización (contracts/modules/compliance-responsibles.md).
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let responsable: Agent;

async function cuenta(companyId: string, email: string, role: 'auditor' | 'responsable') {
  await owner(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role)`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  );
}
const fields = (res: { body: any }) => (res.body.error.fields as Array<{ field: string; code: string; message: string }>).map(({ field, code }) => ({ field, code }));
const create = (agent: Agent, body: object) => agent.post('/v1/responsibles').send(body);

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  await cuenta(a.companyId, `auditor-res-${RUN}@cumplimiento.test`, 'auditor');
  await cuenta(a.companyId, `responsable-res-${RUN}@cumplimiento.test`, 'responsable');
  auditor = await login(app, `auditor-res-${RUN}@cumplimiento.test`);
  responsable = await login(app, `responsable-res-${RUN}@cumplimiento.test`);
});
afterAll(async () => {
  await app?.close();
});

describe('Crear un cargo', () => {
  it('el administrador registra quién ocupa un cargo; el nombre se recorta y queda sin uso', async () => {
    const res = await create(a.agent, { type: 'ciso', person_name: '  Marta Ruiz ' }).expect(201);
    expect(res.body.data).toEqual({ id: expect.any(String), type: 'ciso', person_name: 'Marta Ruiz', is_in_use: false });
  });

  it('el mismo cargo con la misma persona no se repite; con otra persona, sí (varios propietarios de activo)', async () => {
    await create(a.agent, { type: 'asset_owner', person_name: 'Luis Pardo' }).expect(201);
    const dup = await create(a.agent, { type: 'asset_owner', person_name: 'Luis Pardo' }).expect(409);
    expect(dup.body.error.code).toBe('RESPONSIBLE_ALREADY_EXISTS');
    await create(a.agent, { type: 'asset_owner', person_name: 'Ana Mora' }).expect(201);
    // y la misma persona puede ocupar otro cargo
    await create(a.agent, { type: 'it', person_name: 'Luis Pardo' }).expect(201);
  });

  it('valida por campo: tipo fuera de las opciones y nombre vacío', async () => {
    const res = await create(a.agent, { type: 'jefe', person_name: '' }).expect(422);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(fields(res)).toEqual(expect.arrayContaining([{ field: 'type', code: 'enum.invalid' }, { field: 'person_name', code: 'required' }]));
  });

  it('solo el administrador de la empresa gestiona cargos', async () => {
    await create(responsable, { type: 'coo', person_name: 'X' }).expect(403);
    await create(auditor, { type: 'coo', person_name: 'X' }).expect(403);
    await create(monkey, { type: 'coo', person_name: 'X' }).expect(403);
  });

  it('deja su rastro de auditoría', async () => {
    const [{ n }] = await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where action = 'responsible.create' and tenant_id = $1`, [a.companyId]);
    expect(n).toBeGreaterThanOrEqual(3);
  });
});

describe('Ver los cargos', () => {
  it('lo ven todos los roles de la empresa, paginados y filtrados por tipo; admin_monkey no', async () => {
    for (const agent of [a.agent, responsable, auditor]) {
      const res = await agent.get('/v1/responsibles').expect(200);
      expect(res.body.data.total).toBeGreaterThanOrEqual(4);
      expect(res.body.data.items[0]).toEqual({ id: expect.any(String), type: expect.any(String), person_name: expect.any(String), is_in_use: expect.any(Boolean) });
    }
    const owners = (await a.agent.get('/v1/responsibles?type=asset_owner').expect(200)).body.data.items;
    expect(owners.map((o: any) => o.person_name)).toEqual(['Ana Mora', 'Luis Pardo']); // ordenados por nombre
    expect((await a.agent.get('/v1/responsibles?page_size=2&page=2').expect(200)).body.data).toMatchObject({ page: 2, page_size: 2 });
    await a.agent.get('/v1/responsibles?type=raro').expect(422);
    await monkey.get('/v1/responsibles').expect(403);
  });

  it('cada empresa ve solo los suyos', async () => {
    expect((await b.agent.get('/v1/responsibles').expect(200)).body.data.total).toBe(0);
    await create(b.agent, { type: 'ciso', person_name: 'Marta Ruiz' }).expect(201); // el mismo nombre en otra empresa no choca
    expect((await b.agent.get('/v1/responsibles').expect(200)).body.data.total).toBe(1);
  });
});

describe('Cambiar la persona y quitar un cargo', () => {
  async function aCargo(type: string, name: string) {
    return (await create(a.agent, { type, person_name: name }).expect(201)).body.data.id as string;
  }

  it('cambiar la persona no toca lo que apunta al cargo', async () => {
    const id = await aCargo('compliance', 'Carlos Vera');
    const control = (await a.agent.get(`/v1/services/${a.serviceId}/controls?page_size=1`).expect(200)).body.data.items[0].id;
    const [req] = await owner<{ id: string }>(`update tenant.evidence_requirements set responsible_id = $1 where id = (select id from tenant.evidence_requirements where client_control_id = $2 order by sequence limit 1) returning id`, [id, control]);
    const renamed = await a.agent.patch(`/v1/responsibles/${id}`).send({ person_name: 'Diana Rojas' }).expect(200);
    expect(renamed.body.data).toEqual({ id, type: 'compliance', person_name: 'Diana Rojas', is_in_use: true });
    // la evidencia sigue apuntando al mismo cargo, ahora con otra persona
    const evidence = (await a.agent.get(`/v1/controls/${control}`).expect(200)).body.data.evidence.find((e: any) => e.requirement_id === req.id);
    expect(evidence.responsible).toEqual({ id, type: 'compliance', person_name: 'Diana Rojas' });
  });

  it('renombrar a una persona que ya ocupa ese cargo es un conflicto', async () => {
    const id = await aCargo('process', 'Pedro Soto');
    await aCargo('process', 'Elena Cruz');
    const res = await a.agent.patch(`/v1/responsibles/${id}`).send({ person_name: 'Elena Cruz' }).expect(409);
    expect(res.body.error.code).toBe('RESPONSIBLE_ALREADY_EXISTS');
    await a.agent.patch(`/v1/responsibles/${id}`).send({ person_name: '' }).expect(422);
  });

  it('quitar un cargo sin uso funciona; uno del que depende una evidencia o un activo, no', async () => {
    const free = await aCargo('coo', 'Sin uso');
    await a.agent.delete(`/v1/responsibles/${free}`).expect(204);
    await a.agent.patch(`/v1/responsibles/${free}`).send({ person_name: 'Y' }).expect(404);

    const usedByAsset = await aCargo('asset_owner', 'Dueño del activo');
    await owner(`update tenant.assets set responsible_id = $1 where id = $2`, [usedByAsset, a.assetId]);
    const res = await a.agent.delete(`/v1/responsibles/${usedByAsset}`).expect(409);
    expect(res.body.error.code).toBe('RESPONSIBLE_IN_USE');
    // liberado el activo, ya se puede quitar
    await owner(`update tenant.assets set responsible_id = null where id = $1`, [a.assetId]);
    await a.agent.delete(`/v1/responsibles/${usedByAsset}`).expect(204);
  });

  it('solo el administrador cambia o quita; el cargo de otra empresa no existe (404)', async () => {
    const id = await aCargo('it', 'Otro TI');
    await responsable.patch(`/v1/responsibles/${id}`).send({ person_name: 'Z' }).expect(403);
    await auditor.delete(`/v1/responsibles/${id}`).expect(403);
    await b.agent.patch(`/v1/responsibles/${id}`).send({ person_name: 'Z' }).expect(404);
    await b.agent.delete(`/v1/responsibles/${id}`).expect(404);
    await a.agent.delete('/v1/responsibles/no-es-un-uuid').expect(404);
  });

  it('cambios y bajas dejan su rastro de auditoría', async () => {
    const [{ n }] = await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where action in ('responsible.update','responsible.delete') and tenant_id = $1`, [a.companyId]);
    expect(n).toBeGreaterThanOrEqual(3);
  });
});
