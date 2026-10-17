import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootApp } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// Monkey Admin · lectura del catálogo maestro (contracts/modules/monkey-admin-catalog.md). Cada prueba sale por HTTP con la sesión real de cada rol, contra el
// Postgres desechable, que tiene cargado el mismo catálogo del JSON versionado: de él salen las cifras esperadas.
type Agent = Awaited<ReturnType<typeof dosEmpresas>>['monkey'];
type Row = Record<string, any>;

const catalog = JSON.parse(readFileSync(resolve(__dirname, '../../prisma/seed/data/soc2-catalog.json'), 'utf8'));
const withEvidence = new Set<string>(catalog.controlEvidenceTemplates.map((r: { controlCode: string }) => r.controlCode));
// Los controles del marco son los vinculados a algún requisito (marco → requisito → punto de enfoque → control); CPL-1 no lo está.
const linked = new Set<string>(catalog.pointOfFocusControls.map((l: { controlCode: string }) => l.controlCode));
const controlsWithoutEvidence = [...linked].filter((code) => !withEvidence.has(code)).length;

let app: INestApplication;
let a: Tenant;
let monkey: Agent;
let frameworkId: string;

beforeAll(async () => {
  app = await bootApp();
  ({ a, monkey } = await dosEmpresas(app));
  const frameworks = (await monkey.get('/v1/catalog/frameworks').expect(200)).body.data.items as Row[];
  frameworkId = frameworks.find((f) => f.code === catalog.framework.code)!.id;
});
afterAll(async () => {
  await app?.close();
});

const data = async (path: string) => (await monkey.get(path).expect(200)).body.data;

describe('Quién puede leer el catálogo maestro', () => {
  it('solo admin_monkey; el administrador de una empresa recibe 403 y sin sesión, 401', async () => {
    for (const path of ['/v1/catalog/frameworks', `/v1/catalog/frameworks/${frameworkId}/controls`, '/v1/catalog/risks', '/v1/catalog/causes', '/v1/catalog/tests', '/v1/catalog/evidence-templates']) {
      await a.agent.get(path).expect(403);
      await request(app.getHttpServer()).get(path).expect(401);
    }
  });
});

describe('Marcos', () => {
  it('lista el marco con sus conteos', async () => {
    const soc2 = (await data('/v1/catalog/frameworks')).items.find((f: Row) => f.id === frameworkId);
    expect(soc2).toMatchObject({ code: catalog.framework.code, name: catalog.framework.name, version: catalog.framework.version, availability: expect.any(String) });
    expect(soc2.counts).toEqual({ requirements: catalog.requirements.length, controls: linked.size, tests: catalog.tests.length });
  });

  it('el detalle trae los criterios de confianza y cada requisito con sus puntos de enfoque y controles', async () => {
    const framework = await data(`/v1/catalog/frameworks/${frameworkId}`);
    expect(framework.requirements).toHaveLength(catalog.requirements.length);
    expect(framework.requirements[0]).toEqual({
      code: expect.any(String),
      tsc_category: expect.any(String),
      criterion: expect.any(String),
      trust_criterion: expect.any(String),
      points_of_focus_count: expect.any(Number),
      controls_count: expect.any(Number),
    });
    expect(framework.trust_criteria.length).toBeGreaterThan(0);
  });

  it('un marco que no existe, o un id mal escrito, es 404', async () => {
    await monkey.get('/v1/catalog/frameworks/00000000-0000-4000-8000-000000000000').expect(404);
    await monkey.get('/v1/catalog/frameworks/no-es-un-id').expect(404);
    await monkey.get('/v1/catalog/frameworks/00000000-0000-4000-8000-000000000000/controls').expect(404);
  });
});

describe('Controles del marco', () => {
  // Las pruebas de escritura agregan filas monkey_admin a la misma base: aquí se mira solo lo que viene del comité, que es lo que el JSON describe.
  const path = (query = '') => `/v1/catalog/frameworks/${frameworkId}/controls${query.includes('origin=') ? query : `${query}${query ? '&' : '?'}origin=committee`}`;

  it('pagina y trae la forma del contrato', async () => {
    const page = await data(path('?page_size=10'));
    expect(page).toMatchObject({ page: 1, page_size: 10, total: linked.size, total_pages: Math.ceil(linked.size / 10) });
    expect(page.items).toHaveLength(10);
    expect(page.items[0]).toEqual({
      id: expect.any(String),
      code: expect.any(String),
      name: expect.any(String),
      domain: expect.any(String),
      origin: 'committee',
      is_active: true,
      dimensions: expect.any(Array),
      tests_count: expect.any(Number),
      evidence_templates_count: expect.any(Number),
    });
  });

  it('has_evidence_template=false lista justo los controles que el comité dejó sin evidencia requerida', async () => {
    const page = await data(path('?has_evidence_template=false&page_size=100'));
    expect(page.total).toBe(controlsWithoutEvidence);
    expect(page.items.every((c: Row) => c.evidence_templates_count === 0)).toBe(true);
    const withTemplate = await data(path('?has_evidence_template=true&page_size=1'));
    expect(withTemplate.total).toBe(linked.size - controlsWithoutEvidence);
  });

  it('busca por código o nombre y filtra por dominio y por requisito', async () => {
    const first = catalog.controls[0];
    const byCode = await data(path(`?search=${encodeURIComponent(first.code.toLowerCase())}`));
    expect(byCode.items.some((c: Row) => c.code === first.code)).toBe(true);

    const byDomain = await data(path(`?domain=${encodeURIComponent(first.domain)}&page_size=100`));
    expect(byDomain.items.length).toBeGreaterThan(0);
    expect(byDomain.items.every((c: Row) => c.domain === first.domain)).toBe(true);

    const requirement = catalog.pointOfFocusControls.find((l: { controlCode: string }) => l.controlCode === first.code).requirementCode;
    const byRequirement = await data(path(`?requirement_code=${encodeURIComponent(requirement)}&page_size=100`));
    expect(byRequirement.items.some((c: Row) => c.code === first.code)).toBe(true);
    expect(byRequirement.total).toBeLessThan(linked.size);
  });

  it('rechaza un filtro que no existe y un page_size fuera de rango', async () => {
    await monkey.get(path('?inventado=1')).expect(422);
    await monkey.get(path('?page_size=101')).expect(422);
    await monkey.get(path('?origin=otro')).expect(422);
  });

  it('el detalle de un control trae puntos de enfoque, dimensiones, pruebas, evidencias en orden, políticas y causas', async () => {
    const withTests = catalog.controlTests[0].controlCode as string;
    const list = await data(path(`?search=${encodeURIComponent(withTests)}`));
    const id = list.items.find((c: Row) => c.code === withTests).id;
    const control = await data(`/v1/catalog/controls/${id}`);
    expect(control).toMatchObject({ code: withTests, origin: 'committee', is_active: true });
    expect(control.points_of_focus.length).toBeGreaterThan(0);
    expect(control.points_of_focus[0]).toEqual({ framework_code: catalog.framework.code, requirement_code: expect.any(String), number: expect.any(Number), description: expect.any(String) });
    expect(control.tests.length).toBeGreaterThan(0);
    expect(control.tests[0]).toEqual({ id: expect.any(String), code: expect.any(String), dimension: expect.any(String), display_name: expect.any(String), is_active: true });
    const sequences = control.evidence_templates.map((e: Row) => e.sequence);
    expect(sequences).toEqual([...sequences].sort((x: number, y: number) => x - y));
    await monkey.get('/v1/catalog/controls/00000000-0000-4000-8000-000000000000').expect(404);
  });
});

describe('Riesgos, causas, pruebas y plantillas de evidencia', () => {
  it('los riesgos y las causas son globales, no cuelgan de un marco', async () => {
    const risks = await data('/v1/catalog/risks?page_size=100&origin=committee');
    expect(risks.total).toBe(catalog.risks.length);
    expect(risks.items[0]).toEqual({ id: expect.any(String), code: expect.any(String), name: expect.any(String), trust_criterion: expect.any(String), origin: 'committee', is_active: true, causes_count: expect.any(Number) });
    const risk = await data(`/v1/catalog/risks/${risks.items[0].id}`);
    expect(risk.causes.length).toBe(risks.items[0].causes_count);

    const causes = await data('/v1/catalog/causes?page_size=100&origin=committee');
    expect(causes.total).toBe(catalog.causes.length);
    const cause = await data(`/v1/catalog/causes/${causes.items[0].id}`);
    expect(cause.risks.length).toBe(causes.items[0].risks_count);
    expect(cause.controls.length).toBe(causes.items[0].controls_count);
  });

  it('la prueba muestra al administrador de Monkey los textos del comité y el nombre neutro; filtra por dimensión', async () => {
    const tests = await data('/v1/catalog/tests?page_size=100&origin=committee');
    expect(tests.total).toBe(catalog.tests.length);
    const test = await data(`/v1/catalog/tests/${tests.items[0].id}`);
    expect(test.committee).toMatchObject({ objective: expect.any(String), tool: expect.any(String), step_by_step: expect.anything() });
    expect(test.display_name).toEqual(expect.any(String));
    expect(test.display_description).toEqual(expect.any(String));

    const dimension = catalog.tests[0].dimension as string;
    const filtered = await data(`/v1/catalog/tests?dimension=${dimension}&page_size=100&origin=committee`);
    expect(filtered.items.every((t: Row) => t.dimension === dimension)).toBe(true);
    expect(filtered.total).toBe(catalog.tests.filter((t: { dimension: string }) => t.dimension === dimension).length);
  });

  it('las plantillas de evidencia dicen a cuántos controles sirven', async () => {
    const templates = await data('/v1/catalog/evidence-templates?page_size=100&origin=committee');
    expect(templates.total).toBe(catalog.evidenceTemplates.length);
    expect(templates.items[0]).toEqual({ id: expect.any(String), code: expect.any(String), description: expect.any(String), dimension: 'policy', origin: 'committee', is_active: true, controls_count: expect.any(Number) });
  });

  it('ninguna fila del comité está dada de baja', async () => {
    for (const resource of ['risks', 'causes', 'tests', 'evidence-templates']) {
      expect((await data(`/v1/catalog/${resource}?is_active=false&origin=committee`)).total).toBe(0);
    }
    expect((await data(`/v1/catalog/frameworks/${frameworkId}/controls?origin=committee&is_active=false`)).total).toBe(0);
  });
});

describe('Controles de todo el catálogo', () => {
  it('la lista global trae también los controles que no cuelgan de ningún requisito, como CPL-1', async () => {
    const all = await data('/v1/catalog/controls?page_size=100&origin=committee');
    expect(all.total).toBe(catalog.controls.length);
    const unlinked = await data('/v1/catalog/controls?unlinked=true&origin=committee');
    expect(unlinked.items.map((c: Row) => c.code)).toEqual(catalog.controls.filter((c: { code: string }) => !linked.has(c.code)).map((c: { code: string }) => c.code));
  });

  it('se puede acotar a un marco, y un framework_id mal escrito es 422', async () => {
    expect((await data(`/v1/catalog/controls?framework_id=${frameworkId}&page_size=1&origin=committee`)).total).toBe(linked.size);
    await monkey.get('/v1/catalog/controls?framework_id=no-es-un-id').expect(422);
  });
});