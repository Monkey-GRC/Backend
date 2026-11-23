import type { INestApplication } from '@nestjs/common';
import { Agent, bootApp, owner, RUN } from '../support/app';
import { invitarYActivar } from '../support/equipo';
import { dosEmpresas, orgPayload, Tenant } from '../support/escenario';

// MD-211 · Los catálogos que viven en la base en español se traducen al responder, por su código, según Accept-Language; el español de la base queda de respaldo.
let app: INestApplication;
let a: Tenant;
let responsable: Agent;
let n = 0;
const lang = (agent: Agent, path: string, l: string) => agent.get(path).set('Accept-Language', l);

beforeAll(async () => {
  app = await bootApp();
  ({ a } = await dosEmpresas(app));
  responsable = (await invitarYActivar(app, a.agent, { email: `resp-${RUN}-${n++}@idioma.test`, name: 'P', last_name: 'P', role: 'responsable' })).session;
});
afterAll(async () => {
  await app?.close();
});

describe('Conexiones (automated_capabilities)', () => {
  it('GET /v1/catalogs/automated-capabilities: category, method, permisos, frecuencia y evidencia en el idioma pedido', async () => {
    const find = async (l: string) => ((await lang(a.agent, '/v1/catalogs/automated-capabilities', l).expect(200)).body.data.items as any[]).find((c) => c.catalog_code === 'ac_01');
    const es = await find('es');
    const en = await find('en');
    expect(es).toMatchObject({ category: 'Servicios en nube (gestionados, sin servidor)', required_permissions: ['Rol de solo lectura', 'Consentimiento OAuth'], base_frequency: 'cada 6-24 h' });
    expect(en).toMatchObject({ category: 'Cloud services (managed, serverless)', method: 'API authorization / read-only role or OAuth', required_permissions: ['Read-only role', 'OAuth consent'], base_frequency: 'every 6-24 h', generated_evidence: 'Cloud configuration posture and activity logs' });
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
    expect(en).not.toHaveProperty('provider');
  });

  it('GET /v1/services/:id/technical-control: las mismas conexiones traducidas', async () => {
    const find = async (l: string) => ((await lang(a.agent, `/v1/services/${a.serviceId}/technical-control`, l).expect(200)).body.data.applicable_capabilities as any[]).find((c) => c.catalog_code === 'ac_03');
    expect((await find('es')).category).toBe('Bases de datos en nube');
    expect((await find('en')).category).toBe('Cloud databases');
  });
});

describe('Marcos y regulaciones', () => {
  it('GET /v1/catalogs/frameworks y contracted-frameworks: la descripción del marco en el idioma pedido', async () => {
    const desc = async (path: string, l: string) => ((await lang(a.agent, path, l).expect(200)).body.data.items as any[]).find((f) => f.code === 'soc2').description as string;
    expect(await desc('/v1/catalogs/frameworks', 'es')).toMatch(/^Informe de atestación/);
    expect(await desc('/v1/catalogs/frameworks', 'en')).toMatch(/^Attestation report/);
    expect(await desc('/v1/catalogs/contracted-frameworks', 'en')).toMatch(/^Attestation report/);
  });

  it('GET /v1/catalogs/regulations: «Ninguna» y «Otra» traducidas, las leyes con su nombre propio', async () => {
    const items = async (l: string) => (await lang(a.agent, '/v1/catalogs/regulations', l).expect(200)).body.data.items as Array<{ code: string; name: string }>;
    const es = await items('es');
    const en = await items('en');
    expect([es, en].map((l) => l.find((r) => r.code === 'none')!.name)).toEqual(['Ninguna', 'None']);
    expect([es, en].map((l) => l.find((r) => r.code === 'other')!.name)).toEqual(['Otra', 'Other']);
    const law = es.find((r) => r.code !== 'none' && r.code !== 'other')!;
    expect(en.find((r) => r.code === law.code)!.name).toBe(law.name);
  });

  it('GET/PUT /v1/onboarding/organizational-context: las regulaciones «Ninguna» y «Otra» salen en el idioma pedido', async () => {
    const put = await a.agent.put('/v1/onboarding/organizational-context').set('Accept-Language', 'en').send({ ...orgPayload, regulation_codes: ['none'] });
    expect(put.status).toBe(200);
    expect(put.body.data.regulations.find((r: any) => r.code === 'none').name).toBe('None');
    const es = await lang(a.agent, '/v1/onboarding/organizational-context', 'es').expect(200);
    expect(es.body.data.regulations.find((r: any) => r.code === 'none').name).toBe('Ninguna');
    await a.agent.put('/v1/onboarding/organizational-context').send(orgPayload).expect(200);
  });
});

describe('Grupo de responsables por omisión', () => {
  it('GET /v1/groups, /v1/users y /v1/auth/me: el nombre del grupo por omisión en el idioma pedido', async () => {
    const groups = async (l: string) => ((await lang(a.agent, '/v1/groups', l).expect(200)).body.data.items as any[]).filter((g) => g.kind === 'responsables').map((g) => g.name);
    expect(await groups('es')).toEqual(['Responsables']);
    expect(await groups('en')).toEqual(['Responsibles']);
    expect((await lang(responsable, '/v1/auth/me', 'en').expect(200)).body.data.user.group.name).toBe('Responsibles');
    expect((await lang(responsable, '/v1/auth/me', 'es').expect(200)).body.data.user.group.name).toBe('Responsables');
  });
});

describe('Vigencia de la evidencia (validity_within_period)', () => {
  const NAME_EN = 'Neutral name in English (test)';
  let testName: { id: string; es: string };
  let controlId: string;
  let requirementIds: string[] = [];
  afterAll(async () => {
    await owner(`update catalog.tests set display_name_en = null where id = $1`, [testName.id]);
  });
  beforeAll(async () => {
    const list = (await a.agent.get(`/v1/services/${a.serviceId}/controls?page_size=100`).expect(200)).body.data.items as Array<{ id: string }>;
    const [row] = await owner<{ id: string; test_id: string | null }>(
      `select cc.id from tenant.client_controls cc where cc.service_id = $1 and cc.id = any($2::uuid[]) limit 1`,
      [a.serviceId, list.map((c) => c.id)],
    );
    controlId = row.id;
    // El catálogo v2 no trae nombres en inglés (P50): se le pone uno a una prueba y se quita al terminar.
    const [t] = await owner<{ id: string; display_name: string }>(`select id, display_name from catalog.tests where origin = 'committee' and control_id is not null order by code limit 1`);
    testName = { id: t.id, es: t.display_name };
    await owner(`update catalog.tests set display_name_en = $2 where id = $1`, [t.id, NAME_EN]);
    const ins = async (code: string, validity: string, description: string, testId: string | null) =>
      (
        await owner<{ id: string }>(
          `insert into tenant.evidence_requirements (id, tenant_id, client_control_id, code, sequence, description, dimension, test_id, validity_within_period)
           values (gen_random_uuid(), $1, $2, $3, 91, $4, 'policy'::catalog.dimension, $5, $6) returning id`,
          [a.companyId, controlId, code, description, testId, validity],
        )
      )[0].id;
    requirementIds = [
      await ins(`EV-I18N-1-${RUN}`, 'within_evaluation_period', 'Texto de la empresa', null),
      await ins(`EV-I18N-2-${RUN}`, '2026-Q4', t.display_name, t.id),
    ];
  });

  const requirements = async (l: string) => ((await lang(a.agent, `/v1/controls/${controlId}/evidence`, l).expect(200)).body.data.items as any[]).filter((r) => r.code.startsWith('EV-I18N-'));

  it('el marcador se traduce al responder; un período concreto se devuelve tal cual', async () => {
    const [m, q] = await requirements('es');
    expect([m.validity_within_period, q.validity_within_period]).toEqual(['Dentro del período de evaluación', '2026-Q4']);
    const [me, qe] = await requirements('en');
    expect([me.validity_within_period, qe.validity_within_period]).toEqual(['Within the evaluation period', '2026-Q4']);
    expect(requirementIds).toHaveLength(2);
  });

  it('un requerimiento que copió el nombre de la prueba lo muestra en el idioma pedido; el texto de la empresa no se toca', async () => {
    const es = await requirements('es');
    const en = await requirements('en');
    expect(es[1].description).toBe(testName.es);
    expect(en[1].description).toBe(NAME_EN);
    expect(en[0].description).toBe('Texto de la empresa');
  });
});
