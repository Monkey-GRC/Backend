import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootApp, owner, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// Monkey Admin · escritura del catálogo maestro (contracts/modules/monkey-admin-catalog.md). Cada prueba sale por HTTP con la sesión real de admin_monkey, contra el
// Postgres desechable. Todo lo que se crea lleva un sufijo único por corrida (`RUN`) y lo que se vincula al marco se desvincula al terminar, para no alterar las
// cifras del comité que comprueban las pruebas de lectura.
type Agent = Awaited<ReturnType<typeof dosEmpresas>>['monkey'];
type Row = Record<string, any>;

let app: INestApplication;
let a: Tenant;
let monkey: Agent;
let frameworkId: string;

beforeAll(async () => {
  app = await bootApp();
  ({ a, monkey } = await dosEmpresas(app));
  frameworkId = ((await monkey.get('/v1/catalog/frameworks').expect(200)).body.data.items as Row[]).find((f) => f.code === 'soc2')!.id;
});
afterAll(async () => {
  await app?.close();
});

const code = (prefix: string) => `${prefix}-${RUN}`;
const post = async (path: string, body: object, status = 201) => (await monkey.post(`/v1/catalog${path}`).send(body).expect(status)).body;
const patch = async (path: string, body: object, status = 200) => (await monkey.patch(`/v1/catalog${path}`).send(body).expect(status)).body;
const del = (path: string, status = 204) => monkey.delete(`/v1/catalog${path}`).expect(status);
const get = async (path: string) => (await monkey.get(`/v1/catalog${path}`).expect(200)).body.data;
const audited = async (action: string, codeValue: string) =>
  (await owner<{ n: string }>(`select count(*)::text as n from audit.audit_logs where action = $1 and (after_state->>'code' = $2 or before_state->>'code' = $2)`, [action, codeValue]))[0].n;

const CONTROL = (c: string) => ({ code: c, name: `Control de prueba ${c}`, description: 'Un control de prueba agregado desde Monkey Admin.', domain: 'Gestión de Activos' });
const TEST = (c: string, dimension = 'policy') => ({
  code: c,
  dimension,
  name: `Prueba interna ${c}`,
  display_name: `Revisión de ${c}`,
  display_description: 'Verifica que el documento exista y esté vigente.',
  objective: 'Comprobar el documento.',
  type: 'Manual',
});

describe('Quién puede escribir el catálogo', () => {
  it('solo admin_monkey: el administrador de una empresa recibe 403 y sin sesión, 401', async () => {
    const attempts: Array<[string, string, object]> = [
      ['post', '/v1/catalog/controls', CONTROL(code('X'))],
      ['post', '/v1/catalog/risks', { name: 'x' }],
      ['post', '/v1/catalog/tests', TEST(code('T-DOC'))],
      ['patch', '/v1/catalog/controls/00000000-0000-4000-8000-000000000000', { name: 'x' }],
      ['delete', '/v1/catalog/controls/00000000-0000-4000-8000-000000000000', {}],
    ];
    for (const [verb, path, body] of attempts) {
      await (a.agent as any)[verb](path).send(body).expect(403);
      await (request(app.getHttpServer()) as any)[verb](path).send(body).expect(401);
    }
  });
});

describe('Controles', () => {
  const c = code('CTL');
  let id: string;

  it('crea un control propio de Monkey: queda activo, sin requisito y con su rastro', async () => {
    const body = await post('/controls', CONTROL(c));
    id = body.data.id;
    expect(body.data).toMatchObject({ code: c, origin: 'monkey_admin', is_active: true, points_of_focus: [], tests: [], evidence_templates: [] });
    expect(await audited('catalog.control.create', c)).toBe('1');
    const unlinked = await get(`/controls?unlinked=true&origin=monkey_admin&search=${c}`);
    expect(unlinked.items.map((x: Row) => x.code)).toEqual([c]);
  });

  it('un código repetido es 409 y un código mal escrito o un campo que falta, 422', async () => {
    const res = await post('/controls', CONTROL(c), 409);
    expect(res.error.code).toBe('CODE_ALREADY_EXISTS');
    await post('/controls', { ...CONTROL('con espacios'), code: 'con espacios' }, 422);
    await post('/controls', { code: code('SIN'), name: 'sin descripción' }, 422);
    await post('/controls', { ...CONTROL(code('EXTRA')), inventado: 1 }, 422);
  });

  it('edita solo lo que se manda, y un cuerpo vacío es 422', async () => {
    const body = await patch(`/controls/${id}`, { name: 'Nombre nuevo' });
    expect(body.data).toMatchObject({ name: 'Nombre nuevo', domain: 'Gestión de Activos' });
    expect(await audited('catalog.control.update', c)).toBe('1');
    await patch(`/controls/${id}`, {}, 422);
  });

  it('dar de baja no borra: el control sigue ahí, inactivo, y se puede reactivar', async () => {
    await del(`/controls/${id}`);
    await del(`/controls/${id}`); // idempotente
    expect((await get(`/controls/${id}`)).is_active).toBe(false);
    expect((await get(`/controls?is_active=false&search=${c}`)).total).toBe(1);
    expect(await audited('catalog.control.deactivate', c)).toBe('2');
    const back = await patch(`/controls/${id}`, { is_active: true });
    expect(back.data.is_active).toBe(true);
    expect(await audited('catalog.control.reactivate', c)).toBe('1');
  });

  it('un control que no existe, o un id mal escrito, es 404', async () => {
    await patch('/controls/00000000-0000-4000-8000-000000000000', { name: 'x' }, 404);
    await del('/controls/no-es-un-id', 404);
  });

  it('editar un control del comité deja el rastro que el seed lee para marcarlo; aquí se edita y se restaura', async () => {
    const list = await get('/controls?origin=committee&search=CAP-1&page_size=5');
    const original = list.items.find((x: Row) => x.code === 'CAP-1') ?? list.items[0];
    const before = await get(`/controls/${original.id}`);
    await patch(`/controls/${original.id}`, { name: `${before.name} (editado)` });
    expect(await audited('catalog.control.update', before.code)).not.toBe('0');
    await patch(`/controls/${original.id}`, { name: before.name });
    expect((await get(`/controls/${original.id}`)).name).toBe(before.name);
  });
});

describe('Vínculos de un control con el marco', () => {
  const c = code('LNK');
  let id: string;
  let pof: Row;

  beforeAll(async () => {
    id = (await post('/controls', CONTROL(c))).data.id;
    const points = (await get(`/frameworks/${frameworkId}/points-of-focus`)).items as Row[];
    pof = points[0];
  });

  it('lista los puntos de enfoque del marco, también acotados a un requisito', async () => {
    const all = (await get(`/frameworks/${frameworkId}/points-of-focus`)).items as Row[];
    expect(all.length).toBeGreaterThan(100);
    expect(all[0]).toEqual({ id: expect.any(String), framework_code: 'soc2', requirement_code: expect.any(String), number: expect.any(Number), description: expect.any(String), controls_count: expect.any(Number) });
    const one = (await get(`/frameworks/${frameworkId}/points-of-focus?requirement_code=${pof.requirement_code}`)).items as Row[];
    expect(one.every((p) => p.requirement_code === pof.requirement_code)).toBe(true);
    await monkey.get('/v1/catalog/frameworks/00000000-0000-4000-8000-000000000000/points-of-focus').expect(404);
  });

  it('vincular a un punto de enfoque lo hace parte del marco, y desvincular lo devuelve a «sin requisito»', async () => {
    const linked = await post(`/controls/${id}/points-of-focus`, { point_of_focus_id: pof.id });
    expect(linked.data.points_of_focus.map((p: Row) => p.requirement_code)).toEqual([pof.requirement_code]);
    expect((await get(`/controls?framework_id=${frameworkId}&search=${c}`)).total).toBe(1);
    expect((await post(`/controls/${id}/points-of-focus`, { point_of_focus_id: pof.id }, 409)).error.code).toBe('LINK_ALREADY_EXISTS');
    await del(`/controls/${id}/points-of-focus/${pof.id}`);
    expect((await get(`/controls?framework_id=${frameworkId}&search=${c}`)).total).toBe(0);
    expect((await get(`/controls?unlinked=true&search=${c}`)).total).toBe(1);
    await del(`/controls/${id}/points-of-focus/${pof.id}`, 404);
  });
});

describe('Dimensiones, pruebas y evidencias de un control', () => {
  const c = code('DIM');
  const testCode = code('T-DOC');
  let controlId: string;
  let testId: string;

  beforeAll(async () => {
    controlId = (await post('/controls', CONTROL(c))).data.id;
  });

  it('una prueba nueva exige un prefijo que diga su dimensión y que lo que ve el cliente no nombre al proveedor', async () => {
    expect((await post('/tests', { ...TEST(code('T-SRV')), dimension: 'policy' }, 422)).error.fields).toEqual([{ field: 'code', code: 'code.dimension_mismatch', message: expect.any(String) }]);
    const named = await post('/tests', { ...TEST(code('T-DOC')), display_name: 'Revisión con Wazuh', display_description: 'Corre Prowler sobre el servidor.' }, 422);
    expect(named.error.fields.map((f: Row) => f.field).sort()).toEqual(['display_description', 'display_name']);
    const body = await post('/tests', TEST(testCode));
    testId = body.data.id;
    expect(body.data).toMatchObject({ code: testCode, origin: 'monkey_admin', is_active: true, display_name: `Revisión de ${testCode}` });
    expect(await audited('catalog.test.create', testCode)).toBe('1');
    expect((await post('/tests', TEST(testCode), 409)).error.code).toBe('CODE_ALREADY_EXISTS');
  });

  it('una prueba no se vincula a un control que no tiene su dimensión', async () => {
    const res = await post(`/controls/${controlId}/tests`, { test_id: testId }, 422);
    expect(res.error.fields[0]).toMatchObject({ field: 'test_id', code: 'dimension.not_in_control' });
  });

  it('agrega la dimensión, vincula la prueba, y el control no puede quedarse sin ninguna prueba ni sin la dimensión que usa', async () => {
    const added = await post(`/controls/${controlId}/dimensions`, { dimension: 'policy', type: 'manual' });
    expect(added.data.dimensions).toEqual([{ dimension: 'policy', type: 'manual', requires_probe: false, requires_ai: false, requires_compliance_confirmation: false }]);
    expect((await post(`/controls/${controlId}/dimensions`, { dimension: 'policy', type: 'manual' }, 409)).error.code).toBe('LINK_ALREADY_EXISTS');

    const linked = await post(`/controls/${controlId}/tests`, { test_id: testId });
    expect(linked.data.tests.map((t: Row) => t.code)).toEqual([testCode]);
    expect((await post(`/controls/${controlId}/tests`, { test_id: testId }, 409)).error.code).toBe('LINK_ALREADY_EXISTS');

    // la única prueba de un control activo: ni se desvincula, ni se da de baja, ni se quita su dimensión
    expect((await del(`/controls/${controlId}/tests/${testId}`, 409)).body.error.code).toBe('CATALOG_ITEM_IN_USE');
    expect((await patch(`/tests/${testId}`, { is_active: false }, 409)).error.code).toBe('CATALOG_ITEM_IN_USE');
    expect((await del(`/tests/${testId}`, 409)).body.error.code).toBe('CATALOG_ITEM_IN_USE');
    expect((await del(`/controls/${controlId}/dimensions/policy`, 409)).body.error.code).toBe('CATALOG_ITEM_IN_USE');
  });

  it('dando de baja primero el control, su prueba ya se puede desvincular y retirar', async () => {
    await del(`/controls/${controlId}`);
    await del(`/controls/${controlId}/tests/${testId}`);
    await del(`/tests/${testId}`);
    expect((await get(`/tests/${testId}`)).is_active).toBe(false);
    await del(`/controls/${controlId}/dimensions/policy`);
    await del(`/controls/${controlId}/dimensions/policy`, 404);
  });

  it('edita una prueba: los textos que ve el cliente siguen sin poder nombrar al proveedor', async () => {
    await patch(`/tests/${testId}`, { display_name: 'Otro nombre neutro', tool: 'Revisión manual' });
    const t = await get(`/tests/${testId}`);
    expect(t.display_name).toBe('Otro nombre neutro');
    expect(t.committee.tool).toBe('Revisión manual');
    await patch(`/tests/${testId}`, { display_description: 'Usa Wazuh' }, 422);
  });
});

describe('Plantillas de evidencia', () => {
  const c = code('EVD');
  const ids: string[] = [];
  let controlId: string;

  beforeAll(async () => {
    controlId = (await post('/controls', CONTROL(c))).data.id;
    for (const n of [1, 2, 3]) ids.push((await post('/evidence-templates', { code: code(`DOC-${n}`), description: `Documento ${n} ${RUN}` })).data.id);
  });

  const order = async () => ((await get(`/controls/${controlId}`)).evidence_templates as Row[]).map((e) => `${e.sequence}:${e.code}`);

  it('crea una plantilla, que nace como propia de Monkey y en la dimensión documental', async () => {
    const t = await get(`/evidence-templates/${ids[0]}`);
    expect(t).toMatchObject({ origin: 'monkey_admin', is_active: true, dimension: 'policy', controls_count: 0 });
    expect((await post('/evidence-templates', { code: code('DOC-1'), description: 'repetida' }, 409)).error.code).toBe('CODE_ALREADY_EXISTS');
  });

  it('las secuencias de un control son contiguas desde 1 al vincular al final, en medio y al desvincular', async () => {
    await post(`/controls/${controlId}/evidence-templates`, { evidence_template_id: ids[0] });
    await post(`/controls/${controlId}/evidence-templates`, { evidence_template_id: ids[1] });
    expect(await order()).toEqual([`1:${code('DOC-1')}`, `2:${code('DOC-2')}`]);
    await post(`/controls/${controlId}/evidence-templates`, { evidence_template_id: ids[2], sequence: 1 });
    expect(await order()).toEqual([`1:${code('DOC-3')}`, `2:${code('DOC-1')}`, `3:${code('DOC-2')}`]);
    await del(`/controls/${controlId}/evidence-templates/${ids[0]}`);
    expect(await order()).toEqual([`1:${code('DOC-3')}`, `2:${code('DOC-2')}`]);
  });

  it('rechaza una posición fuera de rango y un vínculo repetido', async () => {
    const res = await post(`/controls/${controlId}/evidence-templates`, { evidence_template_id: ids[0], sequence: 9 }, 422);
    expect(res.error.fields[0]).toMatchObject({ field: 'sequence', code: 'sequence.range' });
    expect((await post(`/controls/${controlId}/evidence-templates`, { evidence_template_id: ids[1] }, 409)).error.code).toBe('LINK_ALREADY_EXISTS');
    await del(`/controls/${controlId}/evidence-templates/${ids[0]}`, 404);
  });

  it('el filtro «sin evidencia requerida» deja de listar al control que ya tiene plantillas', async () => {
    const without = await get(`/controls?has_evidence_template=false&origin=monkey_admin&search=${c}`);
    expect(without.total).toBe(0);
  });

  it('se puede editar la descripción y dar de baja una plantilla', async () => {
    await patch(`/evidence-templates/${ids[1]}`, { description: 'Descripción nueva' });
    expect((await get(`/evidence-templates/${ids[1]}`)).description).toBe('Descripción nueva');
    await del(`/evidence-templates/${ids[1]}`);
    expect((await get(`/evidence-templates/${ids[1]}`)).is_active).toBe(false);
  });
});

describe('Riesgos y causas', () => {
  let riskId: string;
  let causeId: string;
  let controlId: string;

  beforeAll(async () => {
    controlId = (await post('/controls', CONTROL(code('RSK')))).data.id;
  });

  it('crea un riesgo y una causa sin código: el servidor asigna el siguiente libre', async () => {
    const risk = await post('/risks', { name: `Riesgo ${RUN}`, description: 'Un riesgo de prueba.', trust_criterion: 'security', potential_impact: ['Reputacional'] });
    riskId = risk.data.id;
    expect(risk.data).toMatchObject({ origin: 'monkey_admin', is_active: true, potential_impact: ['Reputacional'], causes: [] });
    expect(risk.data.code).toMatch(/^R\d{3}$/);
    const cause = await post('/causes', { name: `Causa ${RUN}`, description: 'Una causa de prueba.', failure_category: 'processes' });
    causeId = cause.data.id;
    expect(cause.data.code).toMatch(/^F\d{3}$/);
    await post('/risks', { name: 'x', description: 'x', trust_criterion: 'inventado', potential_impact: ['a'] }, 422);
    await post('/causes', { name: 'x', description: 'x', failure_category: 'inventada' }, 422);
  });

  it('vincula riesgo ↔ causa y causa ↔ control, sin repetir, y desvincula', async () => {
    const risk = await post(`/risks/${riskId}/causes`, { cause_id: causeId });
    expect(risk.data.causes.map((x: Row) => x.id)).toEqual([causeId]);
    expect((await post(`/risks/${riskId}/causes`, { cause_id: causeId }, 409)).error.code).toBe('LINK_ALREADY_EXISTS');
    const cause = await post(`/causes/${causeId}/controls`, { control_id: controlId });
    expect(cause.data.controls.map((x: Row) => x.id)).toEqual([controlId]);
    expect((await post(`/causes/${causeId}/controls`, { control_id: controlId }, 409)).error.code).toBe('LINK_ALREADY_EXISTS');
    await del(`/causes/${causeId}/controls/${controlId}`);
    await del(`/risks/${riskId}/causes/${causeId}`);
    await del(`/risks/${riskId}/causes/${causeId}`, 404);
  });

  it('edita, da de baja y reactiva un riesgo y una causa', async () => {
    await patch(`/risks/${riskId}`, { name: `Riesgo editado ${RUN}`, potential_impact: ['Reputacional', 'Financiero'] });
    expect((await get(`/risks/${riskId}`)).potential_impact).toEqual(['Reputacional', 'Financiero']);
    await del(`/risks/${riskId}`);
    expect((await get(`/risks/${riskId}`)).is_active).toBe(false);
    expect((await patch(`/risks/${riskId}`, { is_active: true })).data.is_active).toBe(true);
    await patch(`/causes/${causeId}`, { failure_category: 'governance' });
    // Al terminar quedan dados de baja: un riesgo o una causa activos se clonarían a todo servicio nuevo y alterarían las cifras de las demás pruebas.
    await del(`/risks/${riskId}`);
    await del(`/causes/${causeId}`);
    expect((await get(`/causes/${causeId}`)).is_active).toBe(false);
    expect((await get(`/risks/${riskId}`)).is_active).toBe(false);
  });
});
