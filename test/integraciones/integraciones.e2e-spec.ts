import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Agent, bootApp, owner, RUN } from '../support/app';
import { invitarYActivar, sembrarEquipo } from '../support/equipo';
import { awsBody, dosEmpresas, Tenant } from '../support/escenario';

// D110 (MD-211): la sección Integraciones. Todo se deriva de las conexiones de la empresa; el catálogo sale de `catalog.integrations`.
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let auditor: Agent;
let responsable: Agent;
let delegado: Agent;
let n = 0;
const email = (k: string) => `${k}-${RUN}-${n++}@integraciones.test`;
const list = (agent: Agent, lang?: string) => agent.get('/v1/integrations').set('Accept-Language', lang ?? 'es');
const catalog = (agent: Agent, lang?: string) => agent.get('/v1/integrations/catalog').set('Accept-Language', lang ?? 'es');
const aws = async (agent: Agent) => ((await list(agent).expect(200)).body.data.items as any[]).find((i) => i.code === 'aws');
const setProvisioning = (assetId: string, status: string) => owner('update tenant.asset_provisionings set connection_status = $2::tenant.provisioning_status where asset_id = $1', [assetId, status]);

beforeAll(async () => {
  app = await bootApp();
  ({ a, b } = await dosEmpresas(app));
  auditor = (await invitarYActivar(app, a.agent, { email: email('auditor'), name: 'P', last_name: 'P', role: 'auditor' })).session;
  const r = await invitarYActivar(app, a.agent, { email: email('responsable'), name: 'P', last_name: 'P', role: 'responsable' });
  responsable = r.session;
  const team = await sembrarEquipo(a.companyId, r.id, `Equipo ${RUN}`);
  delegado = (await invitarYActivar(app, a.agent, { email: email('delegado'), name: 'P', last_name: 'P', role: 'delegado', group_id: team, is_internal: true })).session;
});
afterAll(async () => {
  await app?.close();
});

describe('GET /v1/integrations/catalog', () => {
  it('admin_empresa: 200, las siete filas en el orden del contrato y sin paginar', async () => {
    const res = await catalog(a.agent).expect(200);
    expect(res.body.message).toBe('Catálogo de integraciones.');
    const items = res.body.data.items as any[];
    expect(items.map((i) => i.code)).toEqual(['aws', 'azure', 'gcp', 'microsoft_365', 'google_workspace', 'github', 'jira']);
    expect(items.map((i) => i.purpose)).toEqual([...Array(6).fill('measurement'), 'workflow']);
    expect(items[0]).toMatchObject({ code: 'aws', name: 'Amazon Web Services', logo_key: 'aws', availability: 'available', connection: { category: 'ac_01', platform: 'aws' } });
    expect(items.find((i) => i.code === 'gcp')).toMatchObject({ availability: 'available', connection: { category: 'ac_01', platform: 'gcp' } });
    expect(items[5]).toMatchObject({ code: 'github', name: 'GitHub', logo_key: 'github', availability: 'coming_soon', connection: null, connected: false });
    expect(items[6]).toMatchObject({ code: 'jira', name: 'Jira', logo_key: 'jira', availability: 'coming_soon', connection: null });
    expect(res.body.data).not.toHaveProperty('total');
    expect(JSON.stringify(res.body)).not.toMatch(/wazuh|prowler/i);
  });

  it('el rol auditor, responsable y delegado reciben 403; sin sesión, 401', async () => {
    for (const agent of [auditor, responsable, delegado]) await catalog(agent).expect(403);
    await request(app.getHttpServer()).get('/v1/integrations/catalog').expect(401);
  });

  it('la disponibilidad es la de la plataforma de conexión: si cambia allá, cambia aquí', async () => {
    await owner(`update catalog.capability_platforms set availability = 'available' where code = 'azure' and automated_capability_id = (select id from catalog.automated_capabilities where catalog_code = 'ac_01')`);
    try {
      const items = (await catalog(a.agent).expect(200)).body.data.items as any[];
      expect(items.find((i) => i.code === 'azure').availability).toBe('available');
    } finally {
      await owner(`update catalog.capability_platforms set availability = 'coming_soon' where code = 'azure' and automated_capability_id = (select id from catalog.automated_capabilities where catalog_code = 'ac_01')`);
    }
  });

  it('la descripción sale de i18n según Accept-Language (es y en)', async () => {
    const es = ((await catalog(a.agent, 'es').expect(200)).body.data.items as any[]).find((i) => i.code === 'jira');
    const en = ((await catalog(a.agent, 'en').expect(200)).body.data.items as any[]).find((i) => i.code === 'jira');
    expect(es.description).toBe('Convertirá cada hallazgo en un ticket asignado y seguirá su avance hasta cerrarlo.');
    expect(en.description).toBe('Will turn each finding into an assigned ticket and follow its progress until it is closed.');
    expect((await catalog(a.agent, 'en').expect(200)).body.message).toBe('Integrations catalog.');
  });

  it('connected: solo con una conexión activa (status active, sin padre) de esa integración, y solo de esta empresa', async () => {
    const items = (await catalog(a.agent).expect(200)).body.data.items as any[];
    expect(items.find((i) => i.code === 'aws').connected).toBe(true);
    expect(items.filter((i) => i.connected).map((i) => i.code)).toEqual(['aws']);
    // Un activo dado de baja no cuenta: B retira su única conexión.
    await b.agent.delete(`/v1/assets/${b.assetId}`).expect((r) => expect([200, 204]).toContain(r.status));
    const afterB = (await catalog(b.agent).expect(200)).body.data.items as any[];
    expect(afterB.find((i) => i.code === 'aws').connected).toBe(false);
    // La de A sigue igual: la baja de B no la toca.
    expect(((await catalog(a.agent).expect(200)).body.data.items as any[]).find((i) => i.code === 'aws').connected).toBe(true);
  });
});

describe('GET /v1/integrations', () => {
  it('admin_empresa y auditor: 200 y la misma respuesta; responsable y delegado, 403', async () => {
    const admin = await list(a.agent).expect(200);
    const read = await list(auditor).expect(200);
    expect(admin.body.message).toBe('Integraciones de tu empresa.');
    expect(read.body.data).toEqual(admin.body.data);
    for (const agent of [responsable, delegado]) await list(agent).expect(403);
  });

  it('una integración sin conexiones no aparece: solo está en el catálogo', async () => {
    const codes = ((await list(a.agent).expect(200)).body.data.items as any[]).map((i) => i.code);
    expect(codes).toEqual(['aws']);
    expect(((await list(a.agent).expect(200)).body.data.items as any[])[0].code).not.toBe('jira');
  });

  it('la forma del contrato: estado pending, una conexión y su servicio', async () => {
    await setProvisioning(a.assetId, 'pending');
    const i = await aws(a.agent);
    expect(i).toMatchObject({ code: 'aws', name: 'Amazon Web Services', logo_key: 'aws', purpose: 'measurement', status: 'pending', connection_count: 1, resource_count: 0, last_validated_at: null });
    expect(i.connections).toEqual([
      { asset_id: a.assetId, code: expect.stringMatching(/^AST-/), name: a.assetName, connection_status: 'pending', operational_status: 'not_monitored', needs_attention: false, services: [{ id: a.serviceId, name: a.serviceName }] },
    ]);
  });

  it('active si está activa o programada; needs_attention si la validación falló o el activo está en error', async () => {
    await setProvisioning(a.assetId, 'scheduled');
    expect((await aws(a.agent)).status).toBe('active');
    await setProvisioning(a.assetId, 'failed');
    const failed = await aws(a.agent);
    expect(failed.status).toBe('needs_attention');
    expect(failed.connections[0]).toMatchObject({ connection_status: 'failed', needs_attention: true });
    await setProvisioning(a.assetId, 'active');
    await owner(`update tenant.assets set operational_status = 'error' where id = $1`, [a.assetId]);
    expect((await aws(a.agent)).status).toBe('needs_attention');
    await owner(`update tenant.assets set operational_status = 'not_monitored' where id = $1`, [a.assetId]);
    await setProvisioning(a.assetId, 'pending');
  });

  it('last_validated_at es la validación más reciente entre sus conexiones', async () => {
    const second = (await a.agent.post('/v1/assets').send(awsBody(a, `aws-segunda-${RUN}`)).expect(201)).body.data.id as string;
    await owner(`update tenant.asset_provisionings set last_validated_at = '2026-11-01T10:00:00Z' where asset_id = $1`, [a.assetId]);
    await owner(`update tenant.asset_provisionings set last_validated_at = '2026-11-10T14:03:00Z' where asset_id = $1`, [second]);
    const i = await aws(a.agent);
    expect(i.connection_count).toBe(2);
    expect(i.last_validated_at).toBe('2026-11-10T14:03:00.000Z');
    // Un activo dado de baja deja de contar: ni conexión, ni validación.
    await a.agent.delete(`/v1/assets/${second}`).expect((r) => expect([200, 204]).toContain(r.status));
    const after = await aws(a.agent);
    expect(after.connection_count).toBe(1);
    expect(after.last_validated_at).toBe('2026-11-01T10:00:00.000Z');
  });

  it('la empresa que dio de baja su única conexión ya no ve la integración', async () => {
    expect(await aws(b.agent)).toBeUndefined();
    expect((await list(b.agent).expect(200)).body.data.items).toEqual([]);
  });

  it('aislamiento: cada empresa solo ve sus conexiones', async () => {
    const other = (await b.agent.post('/v1/assets').send(awsBody(b, `aws-b-${RUN}`)).expect(201)).body.data.id as string;
    const mine = await aws(a.agent);
    const theirs = await aws(b.agent);
    expect(mine.connections.map((c: any) => c.asset_id)).toEqual([a.assetId]);
    expect(theirs.connections.map((c: any) => c.asset_id)).toEqual([other]);
    expect(JSON.stringify(mine)).not.toContain(b.serviceName);
    expect(JSON.stringify(theirs)).not.toContain(a.serviceName);
    await b.agent.delete(`/v1/assets/${other}`);
  });

  it('resource_count usa la misma regla que GET /v1/assets/{id}/resources', async () => {
    const [{ id: orgId }] = await owner<{ id: string }>('select organization_id id from tenant.assets where id = $1', [a.assetId]);
    await owner(`update tenant.asset_provisionings set regions = array['us-east-1'], inventory_at = now() where asset_id = $1`, [a.assetId]);
    // visible, de otra región, sin región, de un tipo que el cliente no reconoce y con el activo dado de baja
    const cases: [string, string | null, string, string][] = [['ok-1', 'us-east-1', 'server', 'active'], ['otra-region', 'us-west-2', 'server', 'active'], ['sin-region', null, 'database', 'active'], ['otro-tipo', 'us-east-1', 'other', 'active'], ['de-baja', 'us-east-1', 'server', 'inactive']];
    for (const [uid, region, kind, status] of cases) {
      await owner(
        `with r as (insert into tenant.asset_resources (id, tenant_id, asset_id, resource_uid, resource_type, name, region, kind, attributes, first_seen_at, last_seen_at)
                    values (gen_random_uuid(), $1, $2, $3, 'T', $3, $4, $5, '{}', now(), now()) returning id)
         insert into tenant.assets (id, tenant_id, organization_id, code, connection_category, type, name, platform, criticality, tags, origin, status, operational_status, technical_coverage, parent_asset_id, resource_id)
         select gen_random_uuid(), $1, $6, 'AST-8' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0'), 'ac_02', 'server', $3, 'Servidor', 'medium', '[]'::jsonb, 'discovered', $7::tenant.asset_status, 'not_monitored', '0/18', $2, r.id from r`,
        [a.companyId, a.assetId, `${uid}-${RUN}`, region, kind, orgId, status],
      );
    }
    const expected = (await a.agent.get(`/v1/assets/${a.assetId}/resources`).expect(200)).body.data.total as number;
    expect(expected).toBe(2);
    expect((await aws(a.agent)).resource_count).toBe(expected);
    // Sin descubrimiento no hay recursos que contar.
    await owner('update tenant.asset_provisionings set inventory_at = null where asset_id = $1', [a.assetId]);
    expect((await aws(a.agent)).resource_count).toBe(0);
  });
});

describe('GET /v1/integrations/{code}', () => {
  const detail = (agent: Agent, code: string, lang?: string) => agent.get(`/v1/integrations/${code}`).set('Accept-Language', lang ?? 'es');
  let seededTest: string | null = null;
  let seededCheck: string | null = null;

  beforeAll(async () => {
    // Un check de AWS asignado a una prueba que tenga controles: la cobertura se compara con lo que dice el catálogo cargado, no con cifras fijas.
    const [t] = await owner<{ id: string }>('select t.id from catalog.tests t join catalog.control_tests ct on ct.test_id = t.id join catalog.controls c on c.id = ct.control_id where t.is_active and c.is_active limit 1');
    if (!t) throw new Error('El catálogo de prueba no trae pruebas con controles (corre catalog:load).');
    const [c] = await owner<{ id: string }>(
      `insert into catalog.checks (id, platform, policy_id, check_id, title_en, condition, remediation, origin, mapping_provenance, mapping_confidence)
       values (gen_random_uuid(), 'aws', 'cloud_configuration', $1, 't', 'c', 'r', 'engine_native', 'test', 'low') returning id`,
      [`integraciones_check_${RUN}`],
    );
    await owner('insert into catalog.test_checks (id, test_id, check_id) values (gen_random_uuid(), $1, $2)', [t.id, c.id]);
    // Una prueba de nube con nombre en inglés: el detalle lo elige según el idioma.
    await owner(`insert into catalog.test_checks (id, test_id, check_id) select gen_random_uuid(), id, $1 from catalog.tests where code = 'T-CLD-001' on conflict do nothing`, [c.id]);
    seededTest = t.id;
    seededCheck = c.id;
  });
  afterAll(async () => {
    if (seededCheck) await owner('delete from catalog.test_checks where check_id = $1', [seededCheck]);
    if (seededCheck) await owner('delete from catalog.checks where id = $1', [seededCheck]);
  });

  it('admin_empresa: 200 en una conectada, con el catálogo, el estado y las conexiones de la lista', async () => {
    await setProvisioning(a.assetId, 'scheduled');
    const res = await detail(a.agent, 'aws').expect(200);
    expect(res.body.message).toBe('Detalle de la integración.');
    const d = res.body.data;
    const fromList = await aws(a.agent);
    expect(d).toMatchObject({ code: 'aws', name: 'Amazon Web Services', logo_key: 'aws', purpose: 'measurement', availability: 'available', connection: { category: 'ac_01', platform: 'aws' }, connected: true });
    expect(d).toMatchObject({ status: fromList.status, connection_count: fromList.connection_count, resource_count: fromList.resource_count, last_validated_at: fromList.last_validated_at, connections: fromList.connections });
    expect(d.resource_types).toEqual(['server', 'database', 'storage', 'function']);
    expect(d.permissions).toEqual([
      { name: 'SecurityAudit', detail: expect.any(String), scope: 'arn:aws:iam::aws:policy/SecurityAudit', access: 'read' },
      { name: 'ViewOnlyAccess', detail: expect.any(String), scope: 'arn:aws:iam::aws:policy/job-function/ViewOnlyAccess', access: 'read' },
      { name: 'Asumir el rol', detail: expect.any(String), scope: 'sts:AssumeRole', access: 'read' },
    ]);
    expect(d.security.map((s: any) => s.topic)).toEqual(['read_only', 'temporary_credentials', 'external_id', 'isolated_execution', 'tenant_isolation', 'encrypted_keys']);
    expect(d.features).toHaveLength(5);
    expect(d.prerequisites).toHaveLength(3);
    expect(d.capabilities).toEqual(['Evaluación continua de la configuración', 'Inventario de recursos']);
    expect(d.works_with).toEqual(['Cumplimiento', 'Conexiones de tus servicios']);
    expect(d.overview).toMatch(/^Monkey evalúa de forma continua/);
  });

  it('admin_empresa: una disponible sin conexión llega con lo de la empresa vacío', async () => {
    const d = (await detail(b.agent, 'aws').expect(200)).body.data;
    expect(d).toMatchObject({ connected: false, status: null, connection_count: 0, resource_count: 0, last_validated_at: null, connections: [] });
    expect(d.permissions).toHaveLength(3);
  });

  it('admin_empresa: una coming_soon (con o sin plataforma) llega con prerequisitos, permisos, seguridad y recursos vacíos, y coverage null', async () => {
    for (const code of ['azure', 'microsoft_365', 'google_workspace', 'github', 'jira']) {
      const d = (await detail(a.agent, code).expect(200)).body.data;
      expect(d).toMatchObject({ availability: 'coming_soon', status: null, connections: [], prerequisites: [], permissions: [], resource_types: [], security: [] });
      expect(d.coverage).toBeNull();
      expect(d.overview.length).toBeGreaterThan(20);
      expect(d.features.length).toBeGreaterThan(0);
      expect(d.capabilities.length).toBeGreaterThan(0);
      expect(d.works_with.length).toBeGreaterThan(0);
    }
  });

  it('coverage de AWS: las pruebas con un check de la plataforma, los controles sin repetir y el conteo por marco coinciden con el catálogo', async () => {
    const d = (await detail(a.agent, 'aws').expect(200)).body.data;
    const tests = await owner<{ code: string }>(`select distinct t.code from catalog.tests t join catalog.test_checks tc on tc.test_id = t.id join catalog.checks c on c.id = tc.check_id where t.is_active and c.platform = 'aws' order by t.code`);
    const [controls] = await owner<{ n: number }>(`select count(distinct ct.control_id)::int n from catalog.control_tests ct join catalog.controls k on k.id = ct.control_id where k.is_active and ct.test_id in (select t.id from catalog.tests t join catalog.test_checks tc on tc.test_id = t.id join catalog.checks c on c.id = tc.check_id where t.is_active and c.platform = 'aws')`);
    const frameworks = await owner<{ code: string; n: number }>(
      `select f.code, count(distinct ct.control_id)::int n from catalog.control_tests ct join catalog.controls k on k.id = ct.control_id and k.is_active
         join catalog.point_of_focus_controls pc on pc.control_id = ct.control_id join catalog.points_of_focus p on p.id = pc.point_of_focus_id
         join catalog.requirements r on r.id = p.requirement_id join catalog.frameworks f on f.id = r.framework_id
        where ct.test_id in (select t.id from catalog.tests t join catalog.test_checks tc on tc.test_id = t.id join catalog.checks c on c.id = tc.check_id where t.is_active and c.platform = 'aws')
        group by f.code order by f.code`,
    );
    expect(seededTest).not.toBeNull();
    expect(d.coverage.tests.map((t: any) => t.code)).toEqual(tests.map((t) => t.code));
    expect(d.coverage.tests.length).toBeGreaterThan(0);
    for (const t of d.coverage.tests) expect(t.name).toEqual(expect.any(String));
    expect(d.coverage.controls_count).toBe(controls.n);
    expect(d.coverage.controls_count).toBeGreaterThan(0);
    expect(d.coverage.frameworks.map((f: any) => [f.code, f.controls_count])).toEqual(frameworks.map((f) => [f.code, f.n]));
    for (const f of d.coverage.frameworks) expect(f.controls_count).toBeLessThanOrEqual(d.coverage.controls_count);
  });

  it('coverage.tests[].name sigue el idioma: inglés con display_name_en, español en es', async () => {
    const name = async (lang: string) => ((await detail(a.agent, 'aws', lang).expect(200)).body.data.coverage.tests as any[]).find((t) => t.code === 'T-CLD-001').name;
    expect(await name('en')).toBe('Assessment of IAM, MFA and privileged accounts at the cloud provider');
    expect(await name('es')).toBe('Evaluación de IAM, MFA y cuentas privilegiadas en el proveedor cloud');
  });

  it('auditor: 200 en una conectada y 404 INTEGRATION_NOT_FOUND en una que la empresa no tiene, igual que un código inexistente', async () => {
    expect((await detail(auditor, 'aws').expect(200)).body.data.code).toBe('aws');
    for (const code of ['azure', 'jira', 'no-existe']) {
      const res = await detail(auditor, code).expect(404);
      expect(res.body.error.code).toBe('INTEGRATION_NOT_FOUND');
    }
  });

  it('un código inexistente es 404 INTEGRATION_NOT_FOUND para el admin, con su texto en es y en', async () => {
    const es = await detail(a.agent, 'no-existe').expect(404);
    expect(es.body.error.code).toBe('INTEGRATION_NOT_FOUND');
    expect(es.body.message).toBe('No encontramos esa integración.');
    expect((await detail(a.agent, 'no-existe', 'en').expect(404)).body.message).toBe('We could not find that integration.');
  });

  it('responsable y delegado reciben 403; sin sesión, 401', async () => {
    for (const agent of [responsable, delegado]) await detail(agent, 'aws').expect(403);
    await request(app.getHttpServer()).get('/v1/integrations/aws').expect(401);
  });

  it('los textos salen según Accept-Language y ninguno nombra al motor que evalúa', async () => {
    const es = (await detail(a.agent, 'aws', 'es').expect(200)).body;
    const en = (await detail(a.agent, 'aws', 'en').expect(200)).body;
    expect(en.message).toBe('Integration detail.');
    expect(en.data.overview).toMatch(/^Monkey continuously assesses/);
    expect(en.data.permissions[2].name).toBe('Assume the role');
    expect(en.data.security[0]).toEqual({ topic: 'read_only', text: 'The role cannot create, change or delete anything in your account.' });
    expect(en.data.features).toHaveLength(es.data.features.length);
    for (const code of ['aws', 'azure', 'gcp', 'microsoft_365', 'google_workspace', 'github', 'jira']) {
      for (const lang of ['es', 'en']) expect(JSON.stringify((await detail(a.agent, code, lang).expect(200)).body)).not.toMatch(/wazuh|prowler/i);
    }
  });
});
