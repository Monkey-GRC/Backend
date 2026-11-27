import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootApp, owner, RUN, RUNNER_TOKEN } from '../support/app';
import { awsBody, dosEmpresas, Tenant } from '../support/escenario';

// D112: un backend solo entrega a su trabajador las ejecuciones de SU grupo. Dos backends (grupos distintos) comparten la misma base,
// como el del servidor y el de un desarrollador en local.
const ROLE_ARN = 'arn:aws:iam::123456789012:role/MonkeyReadOnly';
let local: INestApplication;
let server: INestApplication;
let a: Tenant;
let b: Tenant;
const drainQueue = () => owner(`update tenant.executions set status = 'failed', finished_at = now(), failure_reason = 'test.cleanup' where status in ('queued', 'running')`);
const claim = (app: INestApplication) => request(app.getHttpServer()).post('/internal/runner/claim').set('Authorization', `Bearer ${RUNNER_TOKEN}`);
const poolOf = (id: string) => owner<{ runner_pool: string }>('select runner_pool from tenant.executions where id = $1', [id]).then((r) => r[0].runner_pool);

beforeAll(async () => {
  server = await bootApp({ RUNNER_POOL: '' });
  local = await bootApp({ RUNNER_POOL: `local-${RUN}` });
  ({ a, b } = await dosEmpresas(local));
});
afterAll(async () => {
  await drainQueue();
  await local?.close();
  await server?.close();
});
beforeEach(drainQueue);

async function validatedAsset(name: string, t: Tenant = a): Promise<string> {
  const res = await t.agent.post('/v1/assets').send(awsBody(t, name)).expect(201);
  const id = res.body.data.id as string;
  await t.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
  await owner('update tenant.asset_provisionings set external_id = $2 where asset_id = $1', [id, `mk-${RUN}`]);
  await t.agent.post(`/v1/assets/${id}/validate`).expect(200);
  return id;
}

describe('Grupos de trabajadores', () => {
  it('la ejecución lleva el grupo del backend que la creó; solo el trabajador de ese backend la reclama', async () => {
    const assetId = await validatedAsset(`aws-pool-${RUN}`);
    const executionId: string = (await a.agent.post(`/v1/assets/${assetId}/executions`).expect(202)).body.data.id;
    expect(await poolOf(executionId)).toBe(`local-${RUN}`);

    await claim(server).expect(204);
    const res = await claim(local).expect(200);
    expect(res.body.data.execution_id).toBe(executionId);
  });

  it('una ejecución del grupo por defecto no la reclama un backend con otro grupo', async () => {
    const assetId = await validatedAsset(`aws-pool-default-${RUN}`);
    const [{ id: executionId }] = await owner<{ id: string }>(
      `insert into tenant.executions (id, tenant_id, asset_id, status, origin, kind, regions) values (gen_random_uuid(), $1, $2, 'queued', 'manual', 'assessment', '{}') returning id`,
      [a.companyId, assetId],
    );
    expect(await poolOf(executionId)).toBe('default');

    await claim(local).expect(204);
    expect((await claim(server).expect(200)).body.data.execution_id).toBe(executionId);
  });

  it('la función SQL solo reclama del grupo pedido', async () => {
    const assetId = await validatedAsset(`aws-pool-sql-${RUN}`);
    const executionId: string = (await a.agent.post(`/v1/assets/${assetId}/executions`).expect(202)).body.data.id;
    await owner('update tenant.executions set runner_pool = $2 where id = $1', [executionId, 'otro-grupo']);
    const ask = (pool: string) => owner<{ out_execution_id: string }>('select * from tenant.claim_next_execution(null, $1)', [pool]);
    expect(await ask('local-x')).toHaveLength(0);
    expect((await ask('otro-grupo')).map((r) => r.out_execution_id)).toEqual([executionId]);
  });

  it('reparto justo: una empresa con varias corridas encoladas no hace esperar a otra que llegó después', async () => {
    const queue = async (t: Tenant, name: string): Promise<string> => {
      const assetId = await validatedAsset(name, t);
      return (await t.agent.post(`/v1/assets/${assetId}/executions`).expect(202)).body.data.id;
    };
    const first = await queue(a, `aws-fair-a1-${RUN}`);
    const second = await queue(a, `aws-fair-a2-${RUN}`);
    const other = await queue(b, `aws-fair-b1-${RUN}`);

    const claimed: string[] = [];
    for (let i = 0; i < 3; i++) claimed.push((await claim(local).expect(200)).body.data.execution_id);
    // La primera de A (llegó antes), luego la de B (no tiene nada en curso) y al final la segunda de A.
    expect(claimed).toEqual([first, other, second]);
  });
});
