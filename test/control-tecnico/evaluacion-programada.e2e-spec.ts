import type { INestApplication } from '@nestjs/common';
import { QueueScheduledAssessmentsUseCase } from '../../src/features/technical-control/application/use-cases/cloud-schedule.use-cases';
import { bootApp, owner, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// D158: la nube se evalúa sola. De punta a punta contra la base real (la función que mira todas las empresas, la creación dentro de la empresa y el orden de la cola).
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let scheduled: QueueScheduledAssessmentsUseCase;

const asset = async (t: Tenant, frequency: 'every_6h' | 'every_24h' = 'every_24h') => {
  const res = await t.agent
    .post('/v1/assets')
    .send({ name: `aws-prog-${RUN}-${Math.random().toString(36).slice(2, 8)}`, connection_category: 'ac_01', platform: 'aws', connection_method: 'readonly_role', external_account_id: '123456789012', regions: ['us-east-1'], service_ids: [t.serviceId] })
    .expect(201);
  const id = res.body.data.id as string;
  await owner(`update tenant.asset_provisionings set is_active = true, connection_status = 'scheduled', schedule_frequency = $2::tenant.schedule_frequency where asset_id = $1`, [id, frequency]);
  return id;
};
const past = (assetId: string, hoursAgo: number, status: 'completed' | 'failed' = 'completed') =>
  owner(
    `insert into tenant.executions (id, tenant_id, asset_id, status, origin, kind, queued_at, finished_at)
     select gen_random_uuid(), tenant_id, id, $2::tenant.execution_status, 'manual', 'assessment', (now() at time zone 'utc') - make_interval(mins => $3), (now() at time zone 'utc') from tenant.assets where id = $1`,
    [assetId, status, Math.round(hoursAgo * 60)],
  );
const open = (assetId: string) => owner<{ origin: string; status: string }>(`select origin, status from tenant.executions where asset_id = $1 and status in ('queued', 'running')`, [assetId]);
// Cada caso parte de cero: ninguna conexión programada ni ejecución abierta de casos anteriores.
const reset = async () => {
  await owner(`update tenant.executions set status = 'failed', finished_at = now(), failure_reason = 'test.cleanup' where status in ('queued', 'running')`);
  await owner(`update tenant.asset_provisionings set connection_status = 'validated', schedule_frequency = null`);
};

beforeAll(async () => {
  app = await bootApp({ PROBE_MODE: 'runner' });
  ({ a, b } = await dosEmpresas(app));
  scheduled = app.get(QueueScheduledAssessmentsUseCase, { strict: false });
});
afterAll(async () => {
  await reset();
  await app?.close();
});
beforeEach(reset);

describe('Evaluación programada de nube (D158)', () => {
  it('la que nunca se evaluó y la vencida se encolan como programadas, cada una en su empresa; la reciente espera', async () => {
    const never = await asset(a);
    const stale = await asset(b);
    await past(stale, 25);
    expect(await scheduled.execute()).toEqual({ due: 2, queued: 2 });
    for (const id of [never, stale]) expect(await open(id)).toEqual([{ origin: 'scheduled', status: 'queued' }]);
    const history = await a.agent.get(`/v1/assets/${never}/executions`).expect(200);
    expect(history.body.data.items[0]).toMatchObject({ origin: 'scheduled', status: 'queued' });

    await reset();
    const recent = await asset(a);
    await past(recent, 23);
    expect(await scheduled.execute()).toEqual({ due: 0, queued: 0 });
  });

  it('respeta la frecuencia elegida: a las 7 horas toca la de cada 6 y no la de cada 24', async () => {
    const six = await asset(a, 'every_6h');
    const day = await asset(a, 'every_24h');
    await past(six, 7);
    await past(day, 7);
    await scheduled.execute();
    expect(await open(six)).toHaveLength(1);
    expect(await open(day)).toHaveLength(0);
  });

  it('una que falló se reintenta una sola vez a la hora', async () => {
    const early = await asset(a);
    await past(early, 0.5, 'failed');
    const once = await asset(a);
    await past(once, 2, 'failed');
    const twice = await asset(a);
    await past(twice, 5, 'failed');
    await past(twice, 2, 'failed');
    await scheduled.execute();
    expect(await open(early)).toHaveLength(0);
    expect(await open(once)).toHaveLength(1);
    expect(await open(twice)).toHaveLength(0);
  });

  it('no deja más de dos esperando, empieza por la más antigua y repetir la pasada no duplica', async () => {
    const ids = [await asset(a), await asset(a), await asset(b)];
    await past(ids[0], 30);
    await past(ids[1], 50);
    await past(ids[2], 40);
    expect(await scheduled.execute()).toEqual({ due: 2, queued: 2 });
    expect(await open(ids[1])).toHaveLength(1);
    expect(await open(ids[2])).toHaveLength(1);
    expect(await open(ids[0])).toHaveLength(0);
    expect(await scheduled.execute()).toEqual({ due: 0, queued: 0 });
  });

  it('no toca lo que no está programado, lo que ya corre ni una empresa archivada', async () => {
    const off = await asset(a);
    await owner(`update tenant.asset_provisionings set connection_status = 'validated', schedule_frequency = null where asset_id = $1`, [off]);
    const busy = await asset(a);
    await a.agent.post(`/v1/assets/${busy}/executions`).expect(202);
    const archived = await asset(b);
    await owner(`update platform.companies set status = 'deactivated' where id = $1`, [b.companyId]);
    try {
      expect(await scheduled.execute()).toEqual({ due: 0, queued: 0 });
      expect(await open(off)).toHaveLength(0);
      expect(await open(busy)).toEqual([{ origin: 'manual', status: 'queued' }]);
      expect(await open(archived)).toHaveLength(0);
    } finally {
      await owner(`update platform.companies set status = 'active' where id = $1`, [b.companyId]);
    }
  });

  it('en la cola, lo que pide una persona va delante de lo programado aunque haya llegado después', async () => {
    await asset(a);
    await scheduled.execute();
    const manual = await asset(b);
    await b.agent.post(`/v1/assets/${manual}/executions`).expect(202);
    const [first] = await owner<{ out_asset_id: string; out_origin: string }>(`select * from tenant.claim_next_execution('assessment'::tenant.execution_kind, 'default')`);
    expect(first).toMatchObject({ out_asset_id: manual, out_origin: 'manual' });
  });
});
