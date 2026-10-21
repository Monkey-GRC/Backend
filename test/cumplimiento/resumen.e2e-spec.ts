import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-137 · El resumen de cumplimiento de un servicio por marco, categoría y acción que falla (contracts/modules/compliance-overview.md). Cada prueba sale por
// HTTP, con la sesión real de cada rol, contra el Postgres desechable.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let funcional: Agent;
const path = () => `/v1/services/${a.serviceId}/compliance-overview`;

async function cuenta(companyId: string, email: string, role: 'auditor' | 'funcional'): Promise<void> {
  await owner(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role)
     values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role)`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  );
}

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  await cuenta(a.companyId, `auditor-res-${RUN}@cumplimiento.test`, 'auditor');
  await cuenta(a.companyId, `funcional-res-${RUN}@cumplimiento.test`, 'funcional');
  auditor = await login(app, `auditor-res-${RUN}@cumplimiento.test`);
  funcional = await login(app, `funcional-res-${RUN}@cumplimiento.test`);
});
afterAll(async () => {
  await app?.close();
});

const read = async (agent: Agent, query = '') => (await agent.get(`${path()}${query}`).expect(200)).body.data;
const soc2 = (data: any) => data.frameworks.find((f: any) => f.framework_code === 'soc2');

describe('Resumen del servicio — la evaluación aún sin definir (P26)', () => {
  it('un servicio recién clonado responde un bloque por marco, «Sin medir» y sin evaluación', async () => {
    const res = await a.agent.get(path()).expect(200);
    expect(res.body.message).toBeTruthy();
    expect(res.body.data.service_id).toBe(a.serviceId);
    const fw = soc2(res.body.data);
    expect(fw).toMatchObject({ framework_code: 'soc2', name: 'SOC 2', readiness: 'not_measured' });
    expect(fw.evaluation).toEqual({ catalog_version: null, period_start: null, period_end: null, cutoff_date: null, cutoff_frozen: null });
    expect(fw.progress.done).toBe(0);
    expect(fw.progress.total).toBeGreaterThan(20);
    expect(fw.coverage).toEqual({ measured: 0, applicable: fw.progress.total });
  });

  it('solo trae las categorías en alcance, empezando por Seguridad (obligatoria en SOC 2)', async () => {
    const categories = soc2(await read(a.agent)).categories.map((c: any) => c.trust_criterion);
    expect(categories[0]).toBe('security');
    expect(new Set(categories).size).toBe(categories.length);
    for (const c of soc2(await read(a.agent)).categories) {
      expect(c).toEqual({
        trust_criterion: expect.any(String), readiness: 'not_measured', progress: { done: 0, total: expect.any(Number) },
        coverage: { measured: 0, applicable: expect.any(Number) }, failing_controls: [],
      });
    }
  });
});

describe('Resumen del servicio — con la evaluación definida y resultados', () => {
  let failingId: string;
  beforeAll(async () => {
    await owner(`update tenant.service_frameworks set period_start = '2026-01-01', period_end = '2026-12-31', cutoff_date = '2026-10-14' where service_id = $1`, [a.serviceId]);
    // Una acción de seguridad con un test de nube: el activo de la prueba es una cuenta de AWS.
    const rows = await owner<{ id: string; test_id: string; catalog_version_id: string }>(
      `select c.id, t.id as test_id, sf.catalog_version_id
         from tenant.client_controls c
         join tenant.client_control_tests cct on cct.client_control_id = c.id
         join catalog.tests t on t.id = cct.test_id and t.dimension = 'cloud'
         join tenant.service_frameworks sf on sf.service_id = c.service_id
        where c.service_id = $1 and c.is_active order by c.own_code limit 1`,
      [a.serviceId],
    );
    const c = rows[0];
    failingId = c.id;
    await owner(
      `insert into tenant.evaluations (id, tenant_id, service_id, client_control_id, test_id, asset_id, catalog_version_id, dimension, result, origin)
       values (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'cloud', 'non_compliant'::tenant.evaluation_result, 'automated')`,
      [a.companyId, a.serviceId, c.id, c.test_id, a.assetId, c.catalog_version_id],
    );
  });

  it('la evaluación sale con la versión del catálogo, el período y la fecha de corte', async () => {
    const fw = soc2(await read(a.agent));
    // La fecha de corte está guardada (congelada): sale tal cual, sin importar qué día sea hoy (D87).
    expect(fw.evaluation).toEqual({ catalog_version: expect.stringMatching(/^\d+$/), period_start: '2026-01-01', period_end: '2026-12-31', cutoff_date: '2026-10-14', cutoff_frozen: true });
  });

  it('un control que no cumple aparece donde falla, con su código, sus requisitos y el activo afectado', async () => {
    const fw = soc2(await read(a.agent));
    const failing = fw.categories.flatMap((c: any) => c.failing_controls).filter((f: any) => f.control_id === failingId);
    expect(failing.length).toBeGreaterThan(0);
    expect(failing[0]).toMatchObject({ code: expect.stringMatching(/^[A-Z]+-\d+$/), requirement_codes: expect.any(Array), own_code: null, readiness: expect.stringMatching(/needs_work|almost_ready/) });
    expect(failing[0].failing).toEqual([{ dimension: 'cloud', affected: [{ kind: 'asset', id: a.assetId, name: a.assetName }] }]);
    expect(fw.readiness).not.toBe('not_measured');
    expect(fw.coverage.measured).toBe(1);
  });

  it('el marco cuenta controles únicos: el total no supera la suma de las categorías', async () => {
    const fw = soc2(await read(a.agent));
    const sum = fw.categories.reduce((n: number, c: any) => n + c.progress.total, 0);
    expect(fw.progress.total).toBeLessThanOrEqual(sum);
  });

  it('la vista de negocio no trae el bloque técnico, ni códigos de pruebas, ni al proveedor del motor', async () => {
    const text = JSON.stringify(await read(a.agent));
    expect(text).not.toMatch(/"technical"/);
    expect(text).not.toMatch(/\bT-[A-Z]{3}-\d{3}\b/);
    expect(text).not.toMatch(/wazuh|prowler/i);
  });

  it('un funcional ve el marco y las categorías completos, pero ningún fallo de lo que no tiene asignado', async () => {
    const own = soc2(await read(funcional));
    const admin = soc2(await read(a.agent));
    expect(own.progress).toEqual(admin.progress);
    expect(own.categories.map((c: any) => c.progress)).toEqual(admin.categories.map((c: any) => c.progress));
    expect(own.categories.flatMap((c: any) => c.failing_controls)).toEqual([]);
  });
});

describe('Resumen del servicio — quién puede pedir qué', () => {
  it('la vista técnica la piden el administrador (D81), el auditor y el consultor; igual para los dos', async () => {
    const admin = await read(a.agent, '?view=technical');
    const audit = await read(auditor, '?view=technical');
    expect(admin).toEqual(audit);
    const fw = soc2(admin);
    expect(fw.technical).toEqual({ state: expect.any(String), unique_controls: expect.any(Number), failing: expect.any(Array), pending: expect.any(Array), assessments: { consultant: null, auditor: null } });
    expect(fw.technical.unique_controls).toBe(fw.progress.total);
    const category = fw.categories[0];
    expect(category.technical.state).toEqual(expect.any(String));
    const line = category.technical.controls[0];
    expect(line).toEqual({ control_id: expect.any(String), control_code: expect.stringMatching(/^[A-Z]+-\d+$/), state: expect.any(String), progress: { done: expect.any(Number), total: expect.any(Number) }, blocking_tests: expect.any(Array) });
  });

  it('el control que no cumple lista, en la vista técnica, los tests que lo bloquean', async () => {
    const fw = soc2(await read(a.agent, '?view=technical'));
    const lines = fw.categories.flatMap((c: any) => c.technical.controls);
    const blocked = lines.find((l: any) => l.state === 'ineffective');
    expect(blocked).toBeTruthy();
    expect(blocked.blocking_tests.some((t: any) => t.state === 'non_compliant' && /^T-[A-Z]{3}-\d{3}$/.test(t.test_code))).toBe(true);
    expect(fw.technical.state).toBe('non_compliant');
    expect(fw.technical.failing).toContain(blocked.control_code);
  });

  it('el funcional pide la vista técnica y recibe 403; admin_monkey no entra al cumplimiento de una empresa', async () => {
    await funcional.get(`${path()}?view=technical`).expect(403);
    await monkey.get(path()).expect(403);
    await monkey.get(`${path()}?view=technical`).expect(403);
  });

  it('un servicio de otra empresa, o un id que no es UUID, es 404', async () => {
    await a.agent.get(`/v1/services/${b.serviceId}/compliance-overview`).expect(404);
    await a.agent.get('/v1/services/no-es-un-uuid/compliance-overview').expect(404);
  });

  it('un valor de view fuera de las opciones es un error de validación', async () => {
    const res = await a.agent.get(`${path()}?view=otra`).expect(422);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });
});
