import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-117 · Listar y ver las acciones de protección de un servicio (contracts/modules/compliance-controls.md). Cada prueba sale por HTTP, con la sesión
// real de cada rol, contra el Postgres desechable.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let funcional: Agent;
let funcionalId: string;
let listPath: string;
const base = () => `/v1/services/${a.serviceId}/controls`;

async function cuenta(companyId: string, email: string, role: 'auditor' | 'funcional'): Promise<string> {
  const rows = await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role)
     values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  );
  return rows[0].id;
}

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  await cuenta(a.companyId, `auditor-ctl-${RUN}@cumplimiento.test`, 'auditor');
  funcionalId = await cuenta(a.companyId, `funcional-ctl-${RUN}@cumplimiento.test`, 'funcional');
  auditor = await login(app, `auditor-ctl-${RUN}@cumplimiento.test`);
  funcional = await login(app, `funcional-ctl-${RUN}@cumplimiento.test`);
  listPath = base();
});
afterAll(async () => {
  await app?.close();
});

const items = async (agent: Agent, query = '') => (await agent.get(`${listPath}${query}`).expect(200)).body.data.items as Array<Record<string, any>>;

describe('Lista de acciones de protección', () => {
  it('el administrador de la empresa recibe la lista paginada, con la forma del contrato', async () => {
    const res = await a.agent.get(listPath).expect(200);
    expect(res.body.message).toBeTruthy();
    const { items: list, page, page_size, total, total_pages } = res.body.data;
    expect(total).toBeGreaterThan(20); // un servicio recién clonado trae decenas de acciones
    expect(list.length).toBe(Math.min(25, total));
    expect([page, page_size, total_pages]).toEqual([1, 25, Math.ceil(total / 25)]);
    const first = list[0];
    expect(Object.keys(first).sort()).toEqual(
      ['approval', 'assigned_to', 'coverage', 'has_pending_change', 'id', 'name', 'origin', 'own_code', 'progress', 'readiness', 'trust_criteria', 'type'].sort(),
    );
    expect(first).toMatchObject({ origin: 'catalog', own_code: null, approval: 'approved', has_pending_change: false, assigned_to: null });
  });

  it('un servicio recién clonado y sin resultados está «Sin medir»: no inventa ningún cumplimiento', async () => {
    const all = (await a.agent.get(`${listPath}?page_size=100`).expect(200)).body.data.items as Array<Record<string, any>>;
    expect(new Set(all.map((c) => c.readiness))).toEqual(new Set(['not_measured']));
    for (const c of all) expect(c.progress.done).toBe(0);
  });

  it('la vista de negocio no trae códigos del catálogo, ni textos de pruebas, ni al proveedor del motor', async () => {
    const text = JSON.stringify((await a.agent.get(`${listPath}?page_size=100`).expect(200)).body);
    expect(text).not.toMatch(/"technical"|control_code|requirement_codes/);
    expect(text).not.toMatch(/\bCC\d\.\d\b/); // códigos de requisito
    expect(text).not.toMatch(/\bT-[A-Z]{3}-\d{3}\b/); // códigos de prueba
    expect(text).not.toMatch(/\b[A-Z]{2,4}-\d{1,3}\b/); // códigos de control del catálogo (IAC-12)
    expect(text).not.toMatch(/wazuh|prowler/i);
  });

  it('pagina y ordena por el código interno sin mostrarlo', async () => {
    const res = await a.agent.get(`${listPath}?page_size=5&page=2`).expect(200);
    expect(res.body.data.items.length).toBe(5);
    expect(res.body.data.page).toBe(2);
    const asc = await auditor.get(`${listPath}?page_size=100&view=technical`).expect(200);
    const codes = asc.body.data.items.map((c: any) => c.technical.control_code as string);
    const num = (c: string) => Number(/\d+/.exec(c)?.[0]);
    const prefix = (c: string) => c.replace(/\d.*$/, '');
    expect(codes).toEqual([...codes].sort((x, y) => (prefix(x) !== prefix(y) ? prefix(x).localeCompare(prefix(y)) : num(x) - num(y))));
    const desc = await auditor.get(`${listPath}?page_size=100&view=technical&sort=-code`).expect(200);
    expect(desc.body.data.items.map((c: any) => c.technical.control_code)).toEqual([...codes].reverse());
    const byName = (await items(a.agent, '?page_size=100&sort=name')).map((c) => c.name as string);
    expect(byName).toEqual([...byName].sort((x, y) => x.localeCompare(y, 'es')));
  });

  it('filtra por categoría, tipo, semáforo y origen', async () => {
    const all = await items(a.agent, '?page_size=100');
    const security = await items(a.agent, '?page_size=100&trust_criterion=security');
    expect(security.length).toBeGreaterThan(0);
    expect(security.every((c) => c.trust_criteria.includes('security'))).toBe(true);
    const manual = await items(a.agent, '?page_size=100&type=manual');
    expect(manual.every((c) => c.type === 'manual')).toBe(true);
    expect((await items(a.agent, '?page_size=100&readiness=not_measured')).length).toBe(all.length);
    expect(await items(a.agent, '?readiness=ready')).toEqual([]);
    expect(await items(a.agent, '?origin=own')).toEqual([]);
    expect((await items(a.agent, '?origin=catalog&page_size=100')).length).toBe(all.length);
  });

  it('un valor fuera de las opciones es un error de validación, no una lista vacía', async () => {
    const res = await a.agent.get(`${listPath}?readiness=casi`).expect(422);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });
});

describe('Quién puede pedir qué', () => {
  it('admin_monkey no entra al cumplimiento de una empresa por aquí: 403', async () => {
    await monkey.get(listPath).expect(403);
  });

  it('la vista técnica la piden el administrador (D81), el auditor y el consultor; el funcional recibe 403', async () => {
    await funcional.get(`${listPath}?view=technical`).expect(403);
    const id = (await items(a.agent))[0].id;
    await funcional.get(`/v1/controls/${id}?view=technical`).expect(403);
    await monkey.get(`${listPath}?view=technical`).expect(403);
  });

  it('el administrador de la empresa recibe la misma vista técnica que el auditor, con todas las pruebas del control y su estado', async () => {
    const admin = await items(a.agent, '?view=technical&page_size=100');
    const audit = await items(auditor, '?view=technical&page_size=100');
    expect(admin.length).toBe(audit.length);
    expect(admin[0].technical).toEqual({
      control_code: expect.stringMatching(/^[A-Z]+-\d+$/),
      requirement_codes: expect.any(Array),
      points_of_focus: expect.any(Array),
      control_state: expect.any(String),
      tests_count: expect.any(Number),
    });
    // Una prueba de una dimensión sin activos conectados sale igual, como «Sin activos»; las documentales, pendientes.
    const detailOf = async (agent: Agent, id: string) => (await agent.get(`/v1/controls/${id}?view=technical`).expect(200)).body.data;
    const withTests = admin.find((c) => c.technical.tests_count > 0)!;
    const adminDetail = await detailOf(a.agent, withTests.id);
    expect(adminDetail.technical.tests).toHaveLength(withTests.technical.tests_count);
    // `display_description` es la descripción corta del cliente (D82): texto, o nulo en una prueba que aún no la tiene.
    const { display_description: description, ...firstTest } = adminDetail.technical.tests[0];
    expect(firstTest).toEqual({ test_code: expect.any(String), display_name: expect.any(String), dimension: expect.any(String), state: expect.any(String) });
    expect(description === null || typeof description === 'string').toBe(true);
    expect(adminDetail.technical.tests.some((t: any) => t.state === 'no_assets' || t.state === 'pending')).toBe(true);
    expect(adminDetail.technical).toEqual((await detailOf(auditor, withTests.id)).technical);
  });

  it('el auditor de la empresa ve todas las acciones, también con el bloque técnico', async () => {
    const technical = await items(auditor, '?view=technical&page_size=100');
    expect(technical.length).toBe((await items(a.agent, '?page_size=100')).length);
    expect(technical[0].technical).toEqual({
      control_code: expect.stringMatching(/^[A-Z]+-\d+$/),
      requirement_codes: expect.any(Array),
      points_of_focus: expect.any(Array),
      control_state: expect.any(String),
      tests_count: expect.any(Number),
    });
    expect(technical.some((c) => c.technical.requirement_codes.some((r: string) => /^CC\d/.test(r)))).toBe(true);
  });

  it('el funcional sin acciones asignadas recibe una lista vacía, no un error', async () => {
    expect(await items(funcional)).toEqual([]);
  });

  it('el funcional ve solo la acción que tiene asignada; las demás son 403', async () => {
    const [mine, other] = (await items(a.agent, '?page_size=100')).slice(0, 2);
    await owner(`insert into platform.user_control_assignments (id, company_id, user_id, client_control_id, assigned_by) values (gen_random_uuid(), $1, $2, $3, $4)`, [
      a.companyId,
      funcionalId,
      mine.id,
      funcionalId,
    ]);
    const visible = await items(funcional);
    expect(visible.map((c) => c.id)).toEqual([mine.id]);
    expect(visible[0].assigned_to).toMatchObject({ user_id: funcionalId });
    await funcional.get(`/v1/controls/${mine.id}`).expect(200);
    await funcional.get(`/v1/controls/${other.id}`).expect(403);
    // y el administrador sigue viéndolas todas, con el nombre de la persona asignada
    expect((await items(a.agent, `?assigned_to=${funcionalId}`)).map((c) => c.id)).toEqual([mine.id]);
  });
});

describe('Aislamiento entre empresas', () => {
  it('el servicio de otra empresa y su lista no existen: 404', async () => {
    await a.agent.get(`/v1/services/${b.serviceId}/controls`).expect(404);
    await auditor.get(`/v1/services/${b.serviceId}/controls`).expect(404);
  });

  it('una acción de otra empresa no existe: 404, y un id que no es UUID tampoco', async () => {
    const bId = (await b.agent.get(`/v1/services/${b.serviceId}/controls`).expect(200)).body.data.items[0].id;
    await a.agent.get(`/v1/controls/${bId}`).expect(404);
    await auditor.get(`/v1/controls/${bId}`).expect(404);
    await a.agent.get('/v1/controls/no-es-un-uuid').expect(404);
  });
});

describe('Detalle de una acción', () => {
  it('trae la interpretación, las dimensiones, la evidencia que se debe aportar y las causas que mitiga', async () => {
    const all = await items(a.agent, '?page_size=100');
    const list = await Promise.all(all.slice(0, 30).map(async (c) => (await a.agent.get(`/v1/controls/${c.id}`).expect(200)).body.data));
    const rich = list.find((d) => d.evidence.length > 0 && d.dimensions.length > 0) ?? list[0];
    expect(rich).toMatchObject({
      service_id: a.serviceId,
      origin: 'catalog',
      approval: 'approved',
      interpretation: { text: expect.any(String), is_customized: false },
      readiness: 'not_measured',
      has_pending_change: false,
    });
    expect(rich.dimensions[0]).toEqual({ dimension: expect.any(String), applies: expect.any(Boolean), type: expect.anything(), reason_not_applicable: null });
    if (rich.evidence.length) {
      // se clona sin responsable hasta que el administrador lo asigna, y sin entregas
      expect(rich.evidence[0]).toMatchObject({ responsible: null, latest_submission: null, description: expect.any(String) });
    }
    expect(Array.isArray(rich.causes)).toBe(true);
    expect(rich).not.toHaveProperty('technical');
  });

  it('una dimensión que no aplica se declara con su motivo y sin tipo', async () => {
    // El catálogo solo trae las dimensiones que aplican; una que no aplica la declara la empresa (D39). Se crea como dueño, en una dimensión que ningún control tiene.
    const id = (await items(a.agent))[0].id;
    await owner(
      `insert into tenant.client_control_dimensions (id, tenant_id, client_control_id, dimension, type, reason_not_applicable)
       values (gen_random_uuid(), $1, $2, 'app', 'manual', 'No operamos aplicaciones propias.')`,
      [a.companyId, id],
    );
    const d = (await a.agent.get(`/v1/controls/${id}`).expect(200)).body.data;
    expect(d.dimensions.find((x: any) => x.dimension === 'app')).toEqual({ dimension: 'app', applies: false, type: null, reason_not_applicable: 'No operamos aplicaciones propias.' });
    // y una dimensión que no aplica no exige nada: no cuenta en el total
    expect(d.dimensions.filter((x: any) => x.applies).length).toBeGreaterThan(0);
  });
});

describe('El estado sale de los resultados guardados', () => {
  // Busca una acción del servicio con un test de nube: el activo de la prueba es una cuenta de AWS.
  async function targetControl() {
    const rows = await owner<{ id: string; test_id: string; catalog_version_id: string }>(
      `select c.id, t.id as test_id, sf.catalog_version_id
         from tenant.client_controls c
         join tenant.client_control_tests cct on cct.client_control_id = c.id
         join catalog.tests t on t.id = cct.test_id and t.dimension = 'cloud'
         join tenant.service_frameworks sf on sf.service_id = c.service_id
        where c.service_id = $1 and c.is_active order by c.own_code limit 1`,
      [a.serviceId],
    );
    return rows[0];
  }
  const record = (c: { id: string; test_id: string; catalog_version_id: string }, result: string) =>
    owner(
      `insert into tenant.evaluations (id, tenant_id, service_id, client_control_id, test_id, asset_id, catalog_version_id, dimension, result, origin)
       values (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'cloud', $7::tenant.evaluation_result, 'automated')`,
      [a.companyId, a.serviceId, c.id, c.test_id, a.assetId, c.catalog_version_id, result],
    );

  it('un resultado que cumple suma al avance; uno posterior que falla lo señala; el más reciente manda', async () => {
    const c = await targetControl();
    const before = (await auditor.get(`/v1/controls/${c.id}?view=technical`).expect(200)).body.data;

    await record(c, 'compliant');
    const passed = (await auditor.get(`/v1/controls/${c.id}?view=technical`).expect(200)).body.data;
    expect(passed.progress.done).toBe(before.progress.done + 1);
    expect(passed.coverage.measured).toBe(before.coverage.measured + 1);
    expect(passed.readiness).not.toBe('not_measured');
    expect(passed.technical.tests.some((t: any) => t.dimension === 'cloud' && t.state === 'compliant')).toBe(true);
    expect(passed.failing).toEqual([]);

    await record(c, 'non_compliant');
    const failed = (await auditor.get(`/v1/controls/${c.id}?view=technical`).expect(200)).body.data;
    expect(failed.progress.done).toBe(before.progress.done);
    expect(failed.technical.control_state).toBe('ineffective');
    expect(failed.failing).toEqual([{ dimension: 'cloud', affected: [{ kind: 'asset', id: a.assetId, name: a.assetName }] }]);
    expect(failed.readiness).toMatch(/needs_work|almost_ready/);
    // el cliente ve en qué falla, sin códigos
    const business = (await a.agent.get(`/v1/controls/${c.id}`).expect(200)).body.data;
    expect(business.failing[0].affected[0].name).toBe(a.assetName);
    expect(JSON.stringify(business)).not.toMatch(/\bT-[A-Z]{3}-\d{3}\b|control_code/);
  });

  it('filtrar por semáforo encuentra la acción que ya se midió', async () => {
    const measured = await items(a.agent, '?page_size=100&readiness=needs_work');
    const almost = await items(a.agent, '?page_size=100&readiness=almost_ready');
    expect(measured.length + almost.length).toBeGreaterThan(0);
  });
});
