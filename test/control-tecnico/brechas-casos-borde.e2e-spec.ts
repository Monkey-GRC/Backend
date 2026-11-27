import type { INestApplication } from '@nestjs/common';
import { ImportScanUseCase } from '../../src/features/technical-control/application/use-cases/scan.use-cases';
import { bootApp, owner, RUN } from '../support/app';
import { awsBody, dosEmpresas, Tenant } from '../support/escenario';

// MD-502 · Los casos borde de las brechas de una prueba (contracts/cumplimiento/brechas.md): la racha de `failing_since` con dos conexiones en el mismo servicio, un recurso con activo propio (D61), corridas
// fallidas o en curso intercaladas, la misma `finished_at`, la ventana de 90 días, más de 50 recursos, una página fuera de rango y una prueba sin ninguna corrida.
const CHECK_1 = `d90b_uno_${RUN}`;
const CHECK_2 = `d90b_dos_${RUN}`;
const MIN = 60_000;
const DAY = 86_400_000;

let app: INestApplication;
let a: Tenant;
let b: Tenant;
let controlId: string;
let testId: string;
let path: string;
let accountY: string;
let child: string;
let xs: Date[];

const ago = (ms: number) => new Date(Date.now() - ms);
const row = (checkId: string, uid: string, status: 'FAIL' | 'PASS', severity = 'High') => ({
  status_code: status,
  severity,
  status_detail: 'texto crudo del motor',
  metadata: { event_code: checkId },
  cloud: { region: 'us-east-1' },
  resources: [{ uid, type: 'AwsS3Bucket', name: uid.split(':').pop() }],
});
async function scan(assetId: string, at: Date, raw: object[]): Promise<void> {
  await app.get(ImportScanUseCase).execute({ companyId: a.companyId }, { assetId, origin: 'manual' as const, actorUserId: null, startedAt: new Date(at.getTime() - MIN), finishedAt: at, engineVersion: '5.44.0', regions: ['us-east-1'], raw });
}
async function insertCheck(checkId: string, title: string): Promise<void> {
  const [{ id }] = await owner<{ id: string }>(
    `insert into catalog.checks (id, platform, policy_id, check_id, title_en, condition, remediation, origin, mapping_provenance, mapping_confidence)
     values (gen_random_uuid(), 'aws', 'cloud_configuration', $1, $2, 'La condición.', 'Corrige el ajuste.', 'engine_native', 'test', 'low') returning id`,
    [checkId, title],
  );
  await owner(`insert into catalog.test_checks (id, test_id, check_id, role, provenance) values (gen_random_uuid(), $1, $2, 'direct', 'committee_ratified')`, [testId, id]);
}
type Item = Record<string, any>;
const items = async (query = '?page_size=100') => (await a.agent.get(`${path}${query}`).expect(200)).body.data as { items: Item[]; total: number; measured_at: string | null; summary: Item };
const arn = (r: string) => `arn:aws:s3:::${r}-${RUN}`;

beforeAll(async () => {
  await owner(`delete from catalog.test_checks where check_id in (select id from catalog.checks where check_id like 'd90b\\_%')`);
  app = await bootApp();
  ({ a, b } = await dosEmpresas(app));
  const y = await a.agent.post('/v1/assets').send(awsBody(a, `aws-y-${RUN}`, { external_account_id: '210987654321' }));
  if (y.status !== 201) throw new Error(JSON.stringify(y.body));
  accountY = y.body.data.id as string;
  await a.agent.post(`/v1/assets/${accountY}/validate`).expect(200);
  await owner(`update tenant.assets set criticality = 'low' where id = any($1::uuid[])`, [[a.assetId, accountY]]);

  const [t] = await owner<{ id: string; test_id: string }>(
    `select c.id, t.id as test_id from tenant.client_controls c join tenant.client_control_tests cct on cct.client_control_id = c.id
       join catalog.tests t on t.id = cct.test_id and t.dimension = 'cloud' where c.service_id = $1 and c.is_active order by c.own_code limit 1`,
    [a.serviceId],
  );
  controlId = t.id;
  testId = t.test_id;
  path = `/v1/controls/${controlId}/tests/${testId}/findings`;
  await insertCheck(CHECK_1, 'Primer ajuste');
  await insertCheck(CHECK_2, 'Segundo ajuste');

  // Cuenta X (la del escenario): r1 y r2 fallan en la 1.ª corrida; r1 es un recurso con activo propio (D61) desde después de ella; en la 2.ª, r2 pasa y r1 sigue fallando; en la 3.ª vuelven a fallar los dos.
  const x = [ago(40 * MIN), ago(30 * MIN), ago(20 * MIN)];
  await scan(a.assetId, x[0], [row(CHECK_1, arn('r1'), 'FAIL', 'High'), row(CHECK_1, arn('r2'), 'FAIL', 'High')]);
  const [resource] = await owner<{ id: string }>('select id from tenant.asset_resources where asset_id = $1 and resource_uid = $2', [a.assetId, arn('r1')]);
  const [{ id }] = await owner<{ id: string }>(
    `insert into tenant.assets (id, tenant_id, organization_id, code, connection_category, type, name, platform, criticality, tags, origin, status, technical_coverage, parent_asset_id, resource_id)
     select gen_random_uuid(), tenant_id, organization_id, 'AST-B-' || $3, connection_category, 'server', 'recurso-propio-' || $3, platform, 'critical', tags, origin, 'active', technical_coverage, id, $2 from tenant.assets where id = $1 returning id`,
    [a.assetId, resource.id, RUN],
  );
  child = id;
  await owner('insert into tenant.service_assets (id, tenant_id, asset_id, service_id) values (gen_random_uuid(), $1, $2, $3)', [a.companyId, child, a.serviceId]);
  await scan(a.assetId, x[1], [row(CHECK_1, arn('r1'), 'FAIL', 'High'), row(CHECK_1, arn('r2'), 'PASS')]);
  await scan(a.assetId, x[2], [row(CHECK_1, arn('r1'), 'FAIL', 'High'), row(CHECK_1, arn('r2'), 'FAIL', 'High')]);
  xs = x;

  // Una corrida fallida y otra en curso, MÁS NUEVAS que la última completada: no son la «última corrida» ni cortan la racha.
  await owner(`insert into tenant.executions (id, tenant_id, asset_id, status, origin, kind, started_at, finished_at) values (gen_random_uuid(), $1, $2, 'failed', 'manual', 'assessment', $3, $4)`, [a.companyId, a.assetId, ago(6 * MIN), ago(5 * MIN)]);
  await owner(`insert into tenant.executions (id, tenant_id, asset_id, status, origin, kind, started_at) values (gen_random_uuid(), $1, $2, 'running', 'manual', 'assessment', $3)`, [a.companyId, a.assetId, ago(2 * MIN)]);

  // Cuenta Y (otra conexión del mismo servicio): historial largo (la racha llega más atrás de la ventana de 90 días) y dos corridas con LA MISMA finished_at.
  const same = ago(10 * MIN);
  for (const at of [ago(100 * DAY), ago(60 * DAY), ago(30 * DAY), same, same]) await scan(accountY, at, [row(CHECK_1, arn('y1'), 'FAIL', 'Low'), ...Array.from({ length: 60 }, (_, i) => row(CHECK_2, arn(`m${i}`), 'FAIL', 'Low'))]);
});
afterAll(async () => {
  await owner(`delete from catalog.test_checks where check_id in (select id from catalog.checks where check_id like 'd90b\\_%')`);
  // D160 · El recurso con activo propio ya lleva evaluaciones inmutables: se da de baja y se suelta de su recurso.
  await owner(`update tenant.assets set status = 'inactive', resource_id = null where id = $1`, [child]);
  await owner('delete from tenant.service_assets where asset_id = $1', [child]);
  await app?.close();
});

describe('Brechas · racha de failing_since y activos (MD-502)', () => {
  it('un recurso con activo propio (D61) es su propio activo: su criticidad y su racha (desde la 1.ª corrida); el de la cuenta empieza en la 3.ª', async () => {
    const x = xs;
    const { items: list } = await items();
    const own = list.find((i) => i.asset.id === child && i.title === 'Primer ajuste') as Item;
    expect(own).toMatchObject({ kind: 'gap', asset: { name: `recurso-propio-${RUN}`, criticality: 'critical' }, priority: 'critical', resources_total: 1 });
    expect(own.failing_since).toBe(x[0].toISOString());
    const account = list.find((i) => i.asset.id === a.assetId && i.title === 'Primer ajuste') as Item;
    expect(account).toMatchObject({ asset: { criticality: 'low' }, priority: 'medium', resources_total: 1 });
    expect(account.failing_since).toBe(x[2].toISOString());
  });

  it('una corrida fallida o en curso más nueva no es la última corrida ni corta la racha; measured_at es la última completada de todas las conexiones', async () => {
    const d = await items();
    const same = d.measured_at as string;
    expect(new Date(same).getTime()).toBeGreaterThan(Date.now() - 11 * MIN);
    expect(new Date(same).getTime()).toBeLessThan(Date.now() - 9 * MIN);
    const own = d.items.find((i) => i.asset.id === child) as Item;
    expect(own.failing_since).toBe((xs)[0].toISOString());
  });

  it('dos conexiones del mismo servicio llevan cada una su racha; con la misma finished_at hay una sola fila por check y activo', async () => {
    const mine = (await items()).items.filter((i) => i.asset.id === accountY && i.title === 'Primer ajuste');
    expect(mine).toHaveLength(1);
  });

  it('si la racha llega más atrás de la ventana de 90 días, failing_since es el inicio de la ventana', async () => {
    const y = (await items()).items.find((i) => i.asset.id === accountY && i.title === 'Primer ajuste') as Item;
    const since = new Date(y.failing_since).getTime();
    expect(since).toBeGreaterThan(Date.now() - 91 * DAY);
    expect(since).toBeLessThan(Date.now() - 89 * DAY);
  });

  it('más de 50 recursos en un check: se listan 50 y resources_total dice cuántos son', async () => {
    const y = (await items()).items.find((i) => i.asset.id === accountY && i.title === 'Segundo ajuste') as Item;
    expect(y.resources).toHaveLength(50);
    expect(y.resources_total).toBe(60);
  });

  it('una página fuera de rango da items vacío con el total y el resumen intactos', async () => {
    const d = await items('?page=99&page_size=10');
    expect(d.items).toEqual([]);
    expect(d.total).toBeGreaterThan(0);
    expect(d.summary.open_gaps).toBe(d.total);
  });

  it('una prueba sin ninguna corrida completada: measured_at nulo e items vacío', async () => {
    const [mine] = await owner<{ id: string }>(
      `select c.id from tenant.client_controls c join tenant.client_control_tests cct on cct.client_control_id = c.id where c.service_id = $1 and cct.test_id = $2 and c.is_active limit 1`,
      [b.serviceId, testId],
    );
    expect(mine).toBeDefined();
    const res = await b.agent.get(`/v1/controls/${mine.id}/tests/${testId}/findings`).expect(200);
    expect(res.body.data).toMatchObject({ measured_at: null, items: [], total: 0, summary: { open_gaps: 0, excepted: 0, observations: 0 } });
  });
});
