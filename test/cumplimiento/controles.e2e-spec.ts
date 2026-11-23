import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';
import { asignarControl, controlesQueSeparan } from '../support/asignaciones';
import { invitarYActivar, sembrarEquipo } from '../support/equipo';

// MD-117 · Listar y ver las acciones de protección de un servicio (contracts/modules/compliance-controls.md). Cada prueba sale por HTTP, con la sesión
// real de cada rol, contra el Postgres desechable.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let responsable: Agent;
let responsableId: string;
let listPath: string;
const base = () => `/v1/services/${a.serviceId}/controls`;

async function cuenta(companyId: string, email: string, role: 'auditor' | 'responsable'): Promise<string> {
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
  responsableId = await cuenta(a.companyId, `responsable-ctl-${RUN}@cumplimiento.test`, 'responsable');
  auditor = await login(app, `auditor-ctl-${RUN}@cumplimiento.test`);
  responsable = await login(app, `responsable-ctl-${RUN}@cumplimiento.test`);
  listPath = base();
});
afterAll(async () => {
  await app?.close();
});

const items = async (agent: Agent, query = '') => (await agent.get(`${listPath}${query}`).expect(200)).body.data.items as Array<Record<string, any>>;

// Un valor que puede ser nulo o cumplir el comparador.
const nullOr = (matcher: { asymmetricMatch(v: unknown): boolean }) => ({ asymmetricMatch: (v: unknown) => v === null || matcher.asymmetricMatch(v) });

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
      ['approval', 'code', 'coverage', 'executor', 'id', 'name', 'origin', 'owner', 'own_code', 'progress', 'readiness', 'requirement_codes', 'trust_criteria', 'type'].sort(),
    );
    expect(first).toMatchObject({ origin: 'catalog', own_code: null, approval: 'approved', owner: null, executor: null, code: expect.stringMatching(/^[A-Z]+-\d+$/) });
  });

  it('un servicio recién clonado y sin resultados está «Sin medir»: no inventa ningún cumplimiento', async () => {
    const all = (await a.agent.get(`${listPath}?page_size=100`).expect(200)).body.data.items as Array<Record<string, any>>;
    expect(new Set(all.map((c) => c.readiness))).toEqual(new Set(['not_measured']));
    for (const c of all) expect(c.progress.done).toBe(0);
  });

  it('la vista de negocio muestra el código del control y el de sus requisitos (D80), pero no textos de pruebas ni al proveedor del motor', async () => {
    const body = (await a.agent.get(`${listPath}?page_size=100`).expect(200)).body;
    const all = body.data.items as Array<Record<string, any>>;
    for (const c of all) expect(c.code).toMatch(/^[A-Z]+-\d+$/);
    expect(all.some((c) => c.requirement_codes.some((r: string) => /^CC\d\.\d$/.test(r)))).toBe(true);
    const text = JSON.stringify(body);
    expect(text).not.toMatch(/"technical"|control_code/);
    expect(text).not.toMatch(/\bT-[A-Z]{3}-\d{3}\b/); // códigos de prueba
    expect(text).not.toMatch(/wazuh|prowler/i);
  });

  it('pagina y ordena por el código del control', async () => {
    const res = await a.agent.get(`${listPath}?page_size=5&page=2`).expect(200);
    expect(res.body.data.items.length).toBe(5);
    expect(res.body.data.page).toBe(2);
    const asc = await auditor.get(`${listPath}?page_size=100&view=technical`).expect(200);
    const codes = asc.body.data.items.map((c: any) => c.code as string);
    const num = (c: string) => Number(/\d+/.exec(c)?.[0]);
    const prefix = (c: string) => c.replace(/\d.*$/, '');
    expect(codes).toEqual([...codes].sort((x, y) => (prefix(x) !== prefix(y) ? prefix(x).localeCompare(prefix(y)) : num(x) - num(y))));
    const desc = await auditor.get(`${listPath}?page_size=100&view=technical&sort=-code`).expect(200);
    expect(desc.body.data.items.map((c: any) => c.code)).toEqual([...codes].reverse());
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

  it('la vista técnica la piden el administrador (D81) y el auditor; el responsable recibe 403', async () => {
    await responsable.get(`${listPath}?view=technical`).expect(403);
    const id = (await items(a.agent))[0].id;
    await responsable.get(`/v1/controls/${id}?view=technical`).expect(403);
    await monkey.get(`${listPath}?view=technical`).expect(403);
  });

  it('el administrador de la empresa recibe la misma vista técnica que el auditor, con todas las pruebas del control y su estado', async () => {
    const admin = await items(a.agent, '?view=technical&page_size=100');
    const audit = await items(auditor, '?view=technical&page_size=100');
    expect(admin.length).toBe(audit.length);
    expect(admin[0].technical).toEqual({
      points_of_focus: expect.any(Array),
      control_state: expect.any(String),
      level: expect.stringMatching(/^(not_evaluated|ineffective|weak|partial|adequate|solid)$/),
      level_value: expect.any(Number),
      complies: expect.any(Boolean),
      c_percent: nullOr(expect.any(Number)),
      tests_count: expect.any(Number),
    });
    // Una prueba de una dimensión sin activos conectados sale igual, como «Sin activos»; las documentales, pendientes.
    const detailOf = async (agent: Agent, id: string) => (await agent.get(`/v1/controls/${id}?view=technical`).expect(200)).body.data;
    const withTests = admin.find((c) => c.technical.tests_count > 0)!;
    const adminDetail = await detailOf(a.agent, withTests.id);
    expect(adminDetail.technical.tests).toHaveLength(withTests.technical.tests_count);
    // `display_description` es la descripción corta del cliente (D82): texto, o nulo en una prueba que aún no la tiene.
    const { display_description: description, ...firstTest } = adminDetail.technical.tests[0];
    // `test_id` enlaza cada prueba con las evidencias que la respaldan en este control (D88) y lo piden las exclusiones.
    expect(firstTest).toEqual({ test_id: expect.stringMatching(/^[0-9a-f-]{36}$/), test_code: expect.any(String), display_name: expect.any(String), dimension: expect.any(String), state: expect.any(String) });
    expect(description === null || typeof description === 'string').toBe(true);
    expect(adminDetail.technical.tests.some((t: any) => t.state === 'no_assets' || t.state === 'pending')).toBe(true);
    expect(adminDetail.technical).toEqual((await detailOf(auditor, withTests.id)).technical);
    // MD-498 · el detalle técnico trae los requisitos del control con su estado y sus pruebas.
    expect(adminDetail.technical.requirements.length).toBeGreaterThan(0);
    const requirement = adminDetail.technical.requirements[0];
    expect(requirement).toEqual({
      id: expect.any(String), code: expect.stringMatching(/-L\d+$/), text: expect.any(String), type: expect.any(String), periodicity: nullOr(expect.any(String)),
      status: expect.stringMatching(/^(compliant|non_compliant|pending|expired|not_applicable)$/),
      tests: expect.any(Array),
    });
    expect(requirement.tests[0]).toEqual({
      test_id: expect.any(String), test_code: expect.any(String), display_name: expect.any(String), status: expect.stringMatching(/^(pending|correct|observation|exception|not_applicable|expired)$/),
      window_end: nullOr(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)), checks: nullOr(expect.any(Object)), asset_coverage: nullOr(expect.any(Object)),
    });
    expect(JSON.stringify(adminDetail)).not.toMatch(/wazuh|prowler/i);
  });

  it('los requisitos del control solo viajan con view=technical: sin ella, ni el bloque técnico ni el nivel salen', async () => {
    const id = (await items(a.agent))[0].id;
    const plain = (await a.agent.get(`/v1/controls/${id}`).expect(200)).body.data;
    expect(plain.technical).toBeUndefined();
    expect(JSON.stringify(plain)).not.toMatch(/"requirements"|"level"|"c_percent"|"blocking_requirements"/);
    const listed = (await items(a.agent))[0];
    expect(listed.technical).toBeUndefined();
    const technical = (await a.agent.get(`/v1/controls/${id}?view=technical`).expect(200)).body.data.technical;
    expect(Array.isArray(technical.requirements)).toBe(true);
    // la lista técnica trae el nivel pero no el detalle de los requisitos
    expect((await items(a.agent, '?view=technical'))[0].technical.requirements).toBeUndefined();
  });

  it('el auditor de la empresa ve todas las acciones, también con el bloque técnico', async () => {
    const technical = await items(auditor, '?view=technical&page_size=100');
    expect(technical.length).toBe((await items(a.agent, '?page_size=100')).length);
    expect(technical[0].technical).toEqual({
      points_of_focus: expect.any(Array),
      control_state: expect.any(String),
      level: expect.stringMatching(/^(not_evaluated|ineffective|weak|partial|adequate|solid)$/),
      level_value: expect.any(Number),
      complies: expect.any(Boolean),
      c_percent: nullOr(expect.any(Number)),
      tests_count: expect.any(Number),
    });
    expect(technical.some((c) => c.requirement_codes.some((r: string) => /^CC\d/.test(r)))).toBe(true);
  });

  it('el responsable sin acciones asignadas recibe una lista vacía, no un error', async () => {
    expect(await items(responsable)).toEqual([]);
  });

  it('el responsable ve solo los controles de los que es dueño; los demás son 403 (D102)', async () => {
    const { con, sin } = await controlesQueSeparan(a.serviceId);
    await asignarControl(a.companyId, con, responsableId);
    const visible = await items(responsable, '?page_size=100');
    expect(visible.map((c) => c.id)).toContain(con);
    expect(visible.map((c) => c.id)).not.toContain(sin);
    expect(visible.length).toBeLessThan((await items(a.agent, '?page_size=100')).length);
    expect(visible.find((c) => c.id === con)).toMatchObject({ owner: { id: responsableId, name: 'Prueba', last_name: 'Roles', role: 'responsable' }, executor: null });
    await responsable.get(`/v1/controls/${con}`).expect(200);
    await responsable.get(`/v1/controls/${sin}`).expect(403);
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
    });
    expect(rich.dimensions[0]).toEqual({ dimension: expect.any(String), applies: expect.any(Boolean), type: expect.anything(), reason_not_applicable: null });
    if (rich.evidence.length) {
      // se clona sin responsable hasta que el administrador lo asigna, y sin entregas
      expect(rich.evidence[0]).toMatchObject({ responsible: null, latest_submission: null, description: expect.any(String) });
    }
    expect(Array.isArray(rich.causes)).toBe(true);
    // v2: la causa no trae nombre corto (se muestra su descripción).
    for (const cause of rich.causes) expect(cause).toEqual({ id: expect.any(String), code: expect.stringMatching(/^F\d+$/), name: expect.any(String) });
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
         join tenant.client_control_requirements ccr on ccr.client_control_id = c.id
         join catalog.control_requirement_tests crt on crt.control_requirement_id = ccr.control_requirement_id
         join catalog.tests t on t.id = crt.test_id and t.dimension = 'cloud' and t.type = 'technical'
         join tenant.service_frameworks sf on sf.service_id = c.service_id
        where c.service_id = $1 and c.is_active
          and exists (select 1 from catalog.test_checks tc where tc.test_id = t.id and tc.role = 'direct' and tc.check_id is not null)
        order by c.own_code limit 1`,
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

  const cloudTest = (d: any, testId: string) => d.technical.requirements.flatMap((r: any) => r.tests).find((t: any) => t.test_id === testId);

  it('un resultado que cumple deja su prueba Correcta; uno posterior que falla la pasa a Excepción; el más reciente manda', async () => {
    const c = await targetControl();
    const before = (await auditor.get(`/v1/controls/${c.id}?view=technical`).expect(200)).body.data;
    expect(cloudTest(before, c.test_id).status).toBe('pending');

    await record(c, 'compliant');
    const passed = (await auditor.get(`/v1/controls/${c.id}?view=technical`).expect(200)).body.data;
    // Un requisito técnico lleva pruebas de varias dimensiones (T-05): el requisito cumple cuando todas cumplen, no solo la de nube.
    expect(cloudTest(passed, c.test_id)).toMatchObject({ status: 'correct', checks: { direct_pass: 1, direct_fail: 0 }, asset_coverage: { with_result: 1, in_scope: 1 } });
    expect(passed.technical.tests.some((t: any) => t.dimension === 'cloud' && t.state === 'compliant')).toBe(true);
    expect(passed.failing).toEqual([]);

    await record(c, 'non_compliant');
    const failed = (await auditor.get(`/v1/controls/${c.id}?view=technical`).expect(200)).body.data;
    expect(cloudTest(failed, c.test_id)).toMatchObject({ status: 'exception', checks: { direct_pass: 0, direct_fail: 1 } });
    expect(failed.technical.requirements.some((r: any) => r.status === 'non_compliant')).toBe(true);
    expect(failed.technical.control_state).toBe('ineffective');
    expect(failed.complies).toBeUndefined();
    expect(failed.technical.complies).toBe(false);
    expect(failed.failing).toEqual([{ dimension: 'cloud', affected: [{ kind: 'asset', id: a.assetId, name: a.assetName }] }]);
    expect(failed.coverage.measured).toBeGreaterThan(before.coverage.measured);
    expect(failed.readiness).toMatch(/needs_work|almost_ready/);
    // el cliente ve en qué falla, con el código del control y sin códigos de prueba
    const business = (await a.agent.get(`/v1/controls/${c.id}`).expect(200)).body.data;
    expect(business.failing[0].affected[0].name).toBe(a.assetName);
    expect(business.code).toMatch(/^[A-Z]+-\d+$/);
    expect(JSON.stringify(business)).not.toMatch(/\bT-[A-Z]{3}-\d{3}\b|control_code/);
  });

  it('filtrar por semáforo encuentra la acción que ya se midió', async () => {
    const measured = await items(a.agent, '?page_size=100&readiness=needs_work');
    const almost = await items(a.agent, '?page_size=100&readiness=almost_ready');
    expect(measured.length + almost.length).toBeGreaterThan(0);
  });
});

describe('Alcance por dueño y ejecutor (D102)', () => {
  let rA: Awaited<ReturnType<typeof invitarYActivar>>;
  let rB: Awaited<ReturnType<typeof invitarYActivar>>;
  let dA: Awaited<ReturnType<typeof invitarYActivar>>;
  let dSin: Awaited<ReturnType<typeof invitarYActivar>>;
  let c0: string;
  let c1: string;
  const ids = async (agent: Agent, query = '') => (await items(agent, `?page_size=100${query}`)).map((c) => c.id);

  beforeAll(async () => {
    const mail = (k: string) => `${k}-ctl-${RUN}@cumplimiento.test`;
    const person = { name: 'Persona', last_name: 'De Prueba' };
    rA = await invitarYActivar(app, a.agent, { email: mail('alc-ra'), role: 'responsable', ...person });
    rB = await invitarYActivar(app, a.agent, { email: mail('alc-rb'), role: 'responsable', ...person });
    const teamA = await sembrarEquipo(a.companyId, rA.id);
    dA = await invitarYActivar(app, a.agent, { email: mail('alc-da'), role: 'delegado', group_id: teamA, is_internal: true, ...person });
    dSin = await invitarYActivar(app, a.agent, { email: mail('alc-ds'), role: 'delegado', group_id: teamA, is_internal: true, ...person });
    [c0, c1] = (await items(a.agent, '?page_size=100')).slice(5, 7).map((c) => c.id);
    await asignarControl(a.companyId, c0, rA.id, dA.id);
    await asignarControl(a.companyId, c1, rB.id);
  });

  it('el dueño ve lo que ejecutan sus delegados; el ejecutor, solo lo que ejecuta; el que no tiene controles, una lista vacía', async () => {
    expect(await ids(rA.session)).toEqual([c0]);
    expect(await ids(dA.session)).toEqual([c0]);
    expect(await ids(rB.session)).toEqual([c1]);
    expect(await ids(dSin.session)).toEqual([]);
    const todos = await ids(a.agent);
    expect(todos).toEqual(expect.arrayContaining([c0, c1]));
    expect(await ids(auditor)).toEqual(todos);
  });

  it('el detalle trae owner y executor con la forma del contrato; el ajeno de la empresa es 403 y el de otra empresa, 404', async () => {
    for (const agent of [a.agent, auditor, rA.session, dA.session]) {
      const d = (await agent.get(`/v1/controls/${c0}`).expect(200)).body.data;
      expect(d.owner).toEqual({ id: rA.id, name: 'Persona', last_name: 'De Prueba', role: 'responsable' });
      expect(d.executor).toEqual({ id: dA.id, name: 'Persona', last_name: 'De Prueba', role: 'delegado' });
      expect(d).not.toHaveProperty('assigned_to');
    }
    expect((await a.agent.get(`/v1/controls/${c1}`).expect(200)).body.data.executor).toBeNull();
    for (const agent of [rB.session, dSin.session]) await agent.get(`/v1/controls/${c0}`).expect(403);
    await rA.session.get(`/v1/controls/${c1}`).expect(403);
    const ajeno = (await b.agent.get(`/v1/services/${b.serviceId}/controls`).expect(200)).body.data.items[0].id;
    await dA.session.get(`/v1/controls/${c1}`).expect(403);
    for (const agent of [rA.session, dA.session]) await agent.get(`/v1/controls/${ajeno}`).expect(404);
  });

  it('el filtro responsible deja los controles de esa persona, y para un responsable se cruza con los suyos', async () => {
    expect(await ids(a.agent, `&responsible=${dA.id}`)).toEqual([c0]);
    expect(await ids(a.agent, `&responsible=${rB.id}`)).toEqual([c1]);
    expect(await ids(rA.session, `&responsible=${rB.id}`)).toEqual([]);
    await a.agent.get(`${listPath}?responsible=no-es-uuid`).expect(422);
  });

  it('el filtro assignment es solo del administrador: unassigned lista los «Sin asignar», assigned los que tienen dueño; otro rol recibe 403 y un valor ajeno, 422', async () => {
    const todos = await ids(a.agent);
    const sin = await ids(a.agent, '&assignment=unassigned');
    const con = await ids(a.agent, '&assignment=assigned');
    expect(con).toEqual(expect.arrayContaining([c0, c1]));
    expect(sin).not.toContain(c0);
    expect(sin).not.toContain(c1);
    expect(sin.length + con.length).toBe(todos.length);
    for (const agent of [auditor, rA.session, dA.session, monkey]) await agent.get(`${listPath}?assignment=unassigned`).expect(403);
    await a.agent.get(`${listPath}?assignment=otro`).expect(422);
  });

  it('view=technical es 403 para el responsable y el delegado en la lista y el detalle', async () => {
    for (const agent of [rA.session, dA.session, dSin.session]) {
      await agent.get(`${listPath}?view=technical`).expect(403);
      await agent.get(`/v1/controls/${c0}?view=technical`).expect(403);
    }
  });

  it('las pruebas de un control son de admin_empresa y auditor: el dueño, el ejecutor y admin_monkey reciben 403', async () => {
    await a.agent.get(`/v1/controls/${c0}/tests`).expect(200);
    await auditor.get(`/v1/controls/${c0}/tests`).expect(200);
    for (const agent of [rA.session, dA.session, rB.session, dSin.session, monkey]) await agent.get(`/v1/controls/${c0}/tests`).expect(403);
  });
});
