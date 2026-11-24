import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { definirPeriodo, dosEmpresas, Tenant } from '../support/escenario';
import { asignarControl } from '../support/asignaciones';
import { invitarYActivar, sembrarEquipo } from '../support/equipo';

// MD-137 · El resumen de cumplimiento de un servicio por marco, categoría y acción que falla (contracts/modules/compliance-overview.md). Cada prueba sale por
// HTTP, con la sesión real de cada rol, contra el Postgres desechable.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let responsable: Agent;
const path = () => `/v1/services/${a.serviceId}/compliance-overview`;

async function cuenta(companyId: string, email: string, role: 'auditor' | 'responsable'): Promise<void> {
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
  await cuenta(a.companyId, `responsable-res-${RUN}@cumplimiento.test`, 'responsable');
  auditor = await login(app, `auditor-res-${RUN}@cumplimiento.test`);
  responsable = await login(app, `responsable-res-${RUN}@cumplimiento.test`);
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
    await definirPeriodo(a.serviceId, '2026-01-01', '2026-12-31', '2026-10-14');
    // Una acción de seguridad con un test de nube: el activo de la prueba es una cuenta de AWS.
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
    // v2 (MD-498): un control está «decidido» cuando ningún requisito sigue pendiente; este tiene una excepción pero otros requisitos pendientes.
    expect(fw.coverage.measured).toBe(0);
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

  it('un responsable o delegado sin controles recibe el resumen sin marcos (200), nunca el avance de la empresa', async () => {
    const data = await read(responsable);
    expect(data.service_id).toBe(a.serviceId);
    expect(data.frameworks).toEqual([]);
  });

  describe('resumen acotado a lo suyo (D118)', () => {
    let rX: Awaited<ReturnType<typeof invitarYActivar>>;
    let dX: Awaited<ReturnType<typeof invitarYActivar>>;
    let dY: Awaited<ReturnType<typeof invitarYActivar>>;
    let rZ: Awaited<ReturnType<typeof invitarYActivar>>;
    let noSecurity: string;
    const mail = (k: string) => `${k}-res-${RUN}@cumplimiento.test`;
    const person = { name: 'Persona', last_name: 'De Prueba' };

    beforeAll(async () => {
      rX = await invitarYActivar(app, a.agent, { email: mail('d118-rx'), role: 'responsable', ...person });
      rZ = await invitarYActivar(app, a.agent, { email: mail('d118-rz'), role: 'responsable', ...person });
      const team = await sembrarEquipo(a.companyId, rX.id);
      dX = await invitarYActivar(app, a.agent, { email: mail('d118-dx'), role: 'delegado', group_id: team, is_internal: true, ...person });
      dY = await invitarYActivar(app, a.agent, { email: mail('d118-dy'), role: 'delegado', group_id: team, is_internal: true, ...person });
      const all = (await a.agent.get(`/v1/services/${a.serviceId}/controls?page_size=100`).expect(200)).body.data.items as any[];
      const other = all.find((c) => c.id !== failingId && c.trust_criteria.includes('security'))!;
      noSecurity = all.find((c) => c.trust_criteria.length > 0 && !c.trust_criteria.includes('security'))!.id;
      await asignarControl(a.companyId, failingId, rX.id, dX.id);
      await asignarControl(a.companyId, other.id, rX.id);
      await asignarControl(a.companyId, noSecurity, rZ.id, dY.id);
    });

    it('el responsable cuenta solo sus controles (los que ejecutan sus delegados incluidos) y la evaluación es la del servicio', async () => {
      const own = soc2(await read(rX.session));
      const admin = soc2(await read(a.agent));
      expect(own.progress.total).toBe(2);
      expect(own.progress.total).toBeLessThan(admin.progress.total);
      expect(own.coverage).toEqual({ measured: 0, applicable: 2 });
      expect(own.evaluation).toEqual(admin.evaluation);
      expect(own.categories.length).toBeGreaterThan(0);
      for (const c of own.categories) expect(c.progress.total).toBeLessThanOrEqual(2);
      expect(own.categories.flatMap((c: any) => c.failing_controls).map((f: any) => f.control_id)).toContain(failingId);
    });

    it('el delegado ejecutor ve lo que ejecuta; otro delegado, solo lo suyo; y no ven los fallos de controles ajenos', async () => {
      const mine = soc2(await read(dX.session));
      expect(mine.progress.total).toBe(1);
      expect(mine.categories.flatMap((c: any) => c.failing_controls).map((f: any) => f.control_id)).toEqual(expect.arrayContaining([failingId]));
      const other = soc2(await read(dY.session));
      expect(other.progress.total).toBe(1);
      expect(other.categories.flatMap((c: any) => c.failing_controls)).toEqual([]);
    });

    it('la categoría obligatoria no se fuerza: sin controles de Seguridad, Seguridad no sale; el admin_empresa la sigue viendo', async () => {
      for (const agent of [rZ.session, dY.session]) {
        const categories = soc2(await read(agent)).categories.map((c: any) => c.trust_criterion);
        expect(categories.length).toBeGreaterThan(0);
        expect(categories).not.toContain('security');
      }
      expect(soc2(await read(a.agent)).categories.map((c: any) => c.trust_criterion)).toContain('security');
      expect(noSecurity).toBeTruthy();
    });

    it('la vista técnica es 403 para el responsable y el delegado; el servicio de otra empresa, 404', async () => {
      for (const agent of [rX.session, dX.session]) {
        await agent.get(`${path()}?view=technical`).expect(403);
        await agent.get(`/v1/services/${b.serviceId}/compliance-overview`).expect(404);
      }
    });
  });
});

describe('Resumen del servicio — quién puede pedir qué', () => {
  it('la vista técnica la piden el administrador (D81) y el auditor; igual para los dos', async () => {
    const admin = await read(a.agent, '?view=technical');
    const audit = await read(auditor, '?view=technical');
    expect(admin).toEqual(audit);
    const fw = soc2(admin);
    expect(fw.technical).toEqual({ state: expect.any(String), unique_controls: expect.any(Number), failing: expect.any(Array), pending: expect.any(Array) });
    expect(fw.technical.unique_controls).toBe(fw.progress.total);
    const category = fw.categories[0];
    expect(category.technical.state).toEqual(expect.any(String));
    const line = category.technical.controls[0];
    expect(line).toEqual({ control_id: expect.any(String), control_code: expect.stringMatching(/^[A-Z]+-\d+$/), state: expect.any(String), progress: { done: expect.any(Number), total: expect.any(Number) }, level: expect.stringMatching(/^(not_evaluated|ineffective|weak|partial|adequate|solid)$/), level_value: expect.any(Number), complies: expect.any(Boolean), c_percent: { asymmetricMatch: (v: unknown) => v === null || typeof v === 'number' }, blocking_requirements: expect.any(Array), blocking_tests: expect.any(Array) });
  });

  it('el control que no cumple lista, en la vista técnica, los tests que lo bloquean', async () => {
    const fw = soc2(await read(a.agent, '?view=technical'));
    const lines = fw.categories.flatMap((c: any) => c.technical.controls);
    const blocked = lines.find((l: any) => l.state === 'ineffective');
    expect(blocked).toBeTruthy();
    expect(blocked.blocking_tests.some((t: any) => t.state === 'non_compliant' && /^T-[A-Z]{3}-\d+-\d+$/.test(t.test_code))).toBe(true);
    expect(fw.technical.state).toBe('non_compliant');
    expect(fw.technical.failing).toContain(blocked.control_code);
  });

  it('el responsable pide la vista técnica y recibe 403; admin_monkey no entra al cumplimiento de una empresa', async () => {
    await responsable.get(`${path()}?view=technical`).expect(403);
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
