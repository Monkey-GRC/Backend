import type { INestApplication } from '@nestjs/common';
import { bootApp, owner, RUN } from '../support/app';
import { asApp, failure, withRollback } from '../support/db';
import { dosEmpresas, Tenant } from '../support/escenario';

// D112: declarar un servidor con agente desde el marketplace. El cliente declara la VERSIÓN de su sistema (de un catálogo que sirve el backend) y de ella salen
// el comando correcto y qué evaluación se espera. El activo nace con su fila de agente, SIN agente todavía (Monkey lo crea al entregar el comando).
// Las reglas son datos: la prueba pone en el catálogo lo que necesita y lo restaura al terminar (como las regiones en conexion.e2e-spec.ts).
let app: INestApplication;
let a: Tenant;
let b: Tenant;

const UBUNTU = `ubuntu_22_04_lts`;
const UBUNTU_OLD = `ubuntu_14_04_lts`;
const WIN = `windows_server_2022`;
const SCA_IDS = [`e2e_ubuntu22_${RUN}`, `e2e_ubuntu14_${RUN}`, `e2e_win2022_${RUN}`];

type PolicyRow = { sca_id: string; os: string; distribution: string; name: string; version: string; code: string; offerable: boolean; sort: number };
const POLICIES: PolicyRow[] = [
  { sca_id: SCA_IDS[0], os: 'linux', distribution: 'ubuntu', name: 'Ubuntu', version: '22.04 LTS', code: UBUNTU, offerable: true, sort: 10 },
  // Cargada en el catálogo, pero la sonda no la entrega: NO se ofrece (no se promete una evaluación que no existe).
  { sca_id: SCA_IDS[1], os: 'linux', distribution: 'ubuntu', name: 'Ubuntu', version: '14.04 LTS', code: UBUNTU_OLD, offerable: false, sort: 20 },
  { sca_id: SCA_IDS[2], os: 'windows', distribution: 'windows_server', name: 'Windows Server', version: '2022', code: WIN, offerable: true, sort: 30 },
];

const setAvailability = (value: 'available' | 'coming_soon') =>
  owner(
    `update catalog.capability_platforms set availability = $1::catalog.framework_availability
      where code in ('linux', 'windows') and automated_capability_id = (select id from catalog.automated_capabilities where catalog_code = 'ac_04')`,
    [value],
  );

const linux = (t: Tenant, over: Record<string, unknown> = {}) => ({
  name: `srv-${RUN}-${Math.random().toString(36).slice(2, 6)}`, connection_category: 'ac_04', platform: 'linux', connection_method: 'agent', os_version: UBUNTU, service_ids: [t.serviceId], ...over,
});
const create = (t: Tenant, body: Record<string, unknown>) => t.agent.post('/v1/assets').send(body);

beforeAll(async () => {
  app = await bootApp();
  ({ a, b } = await dosEmpresas(app));
  for (const p of POLICIES) {
    await owner(
      `insert into catalog.sca_policies (id, platform, benchmark, sca_id, yaml_file, check_count, os_code, distribution, distribution_name, version_label, version_code, sort_order, is_offerable)
       values (gen_random_uuid(), $1, $2, $3, $4, 10, $5, $6, $7, $8, $9, $10, $11)
       on conflict (sca_id) do update set is_offerable = excluded.is_offerable, version_code = excluded.version_code, os_code = excluded.os_code`,
      [p.os === 'windows' ? 'Windows' : 'Ubuntu', `Política de prueba ${p.code}`, p.sca_id, `${p.sca_id}.yml`, p.os, p.distribution, p.name, p.version, p.code, p.sort, p.offerable],
    );
  }
  // Linux y Windows de «servidores on-premise» se abren con DATOS (el último paso del despliegue), no con código.
  await setAvailability('available');
});

afterAll(async () => {
  await setAvailability('coming_soon');
  await owner(`delete from tenant.asset_agents where sca_policy_id in (select id from catalog.sca_policies where sca_id = any($1))`, [SCA_IDS]).catch(() => undefined);
  await owner(`delete from catalog.sca_policies where sca_id = any($1)`, [SCA_IDS]).catch(() => undefined);
  await app?.close();
});

describe('Declarar un servidor con agente (D112)', () => {
  it('Linux on-premise: el activo nace con su fila de agente, con la versión declarada y SIN agente todavía', async () => {
    const res = await create(a, linux(a)).expect(201);
    const d = res.body.data;
    expect(d).toMatchObject({
      type: 'server', platform: 'linux', connection_category: 'ac_04',
      provisioning: { connection_method: 'agent', connection_status: 'pending', is_active: false },
      agent: { status: 'pending', os: 'linux', os_version: { value: UBUNTU, label: 'Ubuntu 22.04 LTS' } },
    });
    const [row] = await owner<{ agent_id: string | null; status: string; tenant_id: string; sa: string }>(
      `select aa.agent_id, aa.status::text, aa.tenant_id, sp.sca_id sa from tenant.asset_agents aa join catalog.sca_policies sp on sp.id = aa.sca_policy_id where aa.asset_id = $1`,
      [d.id],
    );
    expect(row).toEqual({ agent_id: null, status: 'pending', tenant_id: a.companyId, sa: SCA_IDS[0] });
  });

  it('Windows: su sistema sale de la versión declarada (de ahí saldrá el comando)', async () => {
    const res = await create(a, linux(a, { platform: 'windows', os_version: WIN })).expect(201);
    expect(res.body.data.agent).toMatchObject({ status: 'pending', os: 'windows', os_version: { value: WIN, label: 'Windows Server 2022' } });
  });

  it('las instrucciones son claras, están traducidas y no piden ningún secreto ni nombran a un proveedor', async () => {
    const d = (await create(a, linux(a)).expect(201)).body.data;
    expect(d.connection_setup.method).toBe('agent');
    expect(d.connection_setup.steps).toHaveLength(4);
    expect(d.connection_setup.steps[0]).toMatch(/administrador/i);
    expect(d.connection_setup.steps[3]).toMatch(/Conectado/);
    expect(JSON.stringify(d)).not.toMatch(/wazuh|prowler|credential|secret|encrypted|\bkey\b/i);
  });

  it('el detalle conserva el agente y la versión (la pantalla puede volver)', async () => {
    const id = (await create(a, linux(a)).expect(201)).body.data.id;
    const d = (await a.agent.get(`/v1/assets/${id}`).expect(200)).body.data;
    expect(d.agent).toMatchObject({ status: 'pending', os: 'linux', os_version: { label: 'Ubuntu 22.04 LTS' } });
  });

  it('una cuenta de nube no tiene agente', async () => {
    expect((await a.agent.get(`/v1/assets/${a.assetId}`).expect(200)).body.data.agent).toBeNull();
  });

  it('dos servidores pueden declarar la misma versión (la versión no es única; el agente sí)', async () => {
    await create(a, linux(a)).expect(201);
    await create(a, linux(a)).expect(201);
  });

  it.each([
    ['sin versión (es obligatoria)', { os_version: undefined }, 'required'],
    ['una versión vacía', { os_version: '' }, 'required'],
    ['una versión que no existe', { os_version: 'ubuntu_99_04_lts' }, 'invalid'],
    ['una versión con forma rara', { os_version: 'Ubuntu 22; drop table' }, 'invalid'],
    ['una versión que la sonda no entrega (no se promete lo que no hay)', { os_version: UBUNTU_OLD }, 'invalid'],
    ['una versión de OTRO sistema (Windows para Linux: el comando saldría equivocado)', { os_version: WIN }, 'invalid'],
  ])('rechaza %s (422, campo os_version)', async (_n, over, code) => {
    const res = await create(a, linux(a, over)).expect(422);
    expect(res.body.error.fields).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'os_version', code, message: expect.any(String) })]));
  });

  it('en una cuenta de nube la versión sobra: no se acepta', async () => {
    const res = await create(a, { name: `aws-${RUN}-x`, connection_category: 'ac_01', platform: 'aws', connection_method: 'readonly_role', external_account_id: '123456789012', regions: ['us-east-1'], service_ids: [a.serviceId], os_version: UBUNTU }).expect(422);
    expect(res.body.error.fields).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'os_version', code: 'field.not_allowed' })]));
  });

  it('un rechazo no deja nada a medias: ni activo ni fila de agente', async () => {
    const name = `rechazado-${RUN}`;
    await create(a, linux(a, { name, os_version: 'no_existe' })).expect(422);
    expect(await owner(`select 1 from tenant.assets where name = $1`, [name])).toHaveLength(0);
  });

  it('una plataforma que sigue bloqueada (macOS en equipos) no se declara aunque la versión exista', async () => {
    const res = await create(a, linux(a, { connection_category: 'ac_06', platform: 'macos', os_version: 'macos_13_ventura' })).expect(422);
    expect(res.body.error.fields).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'platform', code: 'connection.provider_not_supported' })]));
  });

  it('con la plataforma bloqueada (próximamente) no se declara: abrirla es un dato, no código', async () => {
    await setAvailability('coming_soon');
    try {
      const res = await create(a, linux(a)).expect(422);
      expect(res.body.error.fields).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'platform', code: 'connection.provider_not_supported' })]));
    } finally {
      await setAvailability('available');
    }
    await create(a, linux(a)).expect(201);
  });
});

describe('El catálogo de versiones lo sirve el backend (la pantalla no hardcodea)', () => {
  it('linux_version: solo lo que la sonda entrega, con su texto y agrupado por distribución', async () => {
    const items = (await a.agent.get('/v1/catalogs/linux_version').expect(200)).body.data.items as { value: string; label: string; group: string; group_label: string }[];
    expect(items.find((i) => i.value === UBUNTU)).toEqual({ value: UBUNTU, label: 'Ubuntu 22.04 LTS', group: 'ubuntu', group_label: 'Ubuntu' });
    expect(items.map((i) => i.value)).not.toContain(UBUNTU_OLD);
    expect(items.map((i) => i.value)).not.toContain(WIN);
  });

  it('windows_version: las de Windows', async () => {
    const items = (await a.agent.get('/v1/catalogs/windows_version').expect(200)).body.data.items as { value: string; label: string }[];
    expect(items.find((i) => i.value === WIN)).toMatchObject({ label: 'Windows Server 2022' });
  });

  it('un sistema sin ninguna versión que ofrecer responde 404', async () => {
    await a.agent.get('/v1/catalogs/aix_version').expect(404);
  });

  it('abrir una versión es un dato: marcarla como ofrecida cambia el catálogo y lo que el alta acepta', async () => {
    try {
      await owner(`update catalog.sca_policies set is_offerable = true where sca_id = $1`, [SCA_IDS[1]]);
      const items = (await a.agent.get('/v1/catalogs/linux_version').expect(200)).body.data.items as { value: string }[];
      expect(items.map((i) => i.value)).toContain(UBUNTU_OLD);
      await create(a, linux(a, { os_version: UBUNTU_OLD })).expect(201);
    } finally {
      await owner(`update catalog.sca_policies set is_offerable = false where sca_id = $1`, [SCA_IDS[1]]);
    }
    await create(a, linux(a, { os_version: UBUNTU_OLD })).expect(422);
  });
});

describe('Aislamiento entre empresas (SEG-45, RLS de asset_agents)', () => {
  it('una empresa no ve el servidor de otra, ni por la API ni en la base', async () => {
    const id = (await create(a, linux(a)).expect(201)).body.data.id as string;
    await b.agent.get(`/v1/assets/${id}`).expect(404);
    const countAs = (tenantId: string) =>
      withRollback((db) => asApp(db, { tenantId }, async () => Number((await db.query(`select count(*)::int c from tenant.asset_agents where asset_id = $1`, [id])).rows[0].c)));
    expect(await countAs(a.companyId)).toBe(1);
    expect(await countAs(b.companyId)).toBe(0);
  });

  it('una empresa no puede declarar un agente a nombre de otra (la base lo rechaza)', async () => {
    const policy = (await owner<{ id: string }>(`select id from catalog.sca_policies where sca_id = $1`, [SCA_IDS[0]]))[0].id;
    const err = await withRollback((db) =>
      asApp(db, { tenantId: b.companyId }, () =>
        failure(db, `insert into tenant.asset_agents (id, tenant_id, asset_id, sca_policy_id) values (gen_random_uuid(), $1, $2, $3)`, [a.companyId, a.assetId, policy]),
      ),
    );
    expect(err).toMatch(/row-level security/i);
  });
});
