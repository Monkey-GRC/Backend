import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootApp, owner } from '../support/app';
import { definirPeriodo, dosEmpresas, Tenant } from '../support/escenario';

// RC-19, MD-495 · Los parámetros del motor de evaluación (contracts/catalogo-maestro.md «Parámetros de evaluación»): GET, PATCH, errores, auditoría y que el motor
// los lea de la tabla en la siguiente lectura. Lo que se cambia aquí se restaura al terminar: la tabla es global.
type Agent = Awaited<ReturnType<typeof dosEmpresas>>['monkey'];

let app: INestApplication;
let a: Tenant;
let monkey: Agent;

const PATH = '/v1/catalog/evaluation-parameters';
const ALERT = { daily: 0, weekly: 2, monthly: 5, bimonthly: 10, quarterly: 15, semiannual: 20, annual: 30 };
const KEYS = [
  'partial_threshold', 'weak_threshold', 'asset_coverage', 'check_exception_max_days', 'freshness_hours', 'alert_days_before', 'on_demand_alert_days', 'validity_windows',
  'risk_partial_mitigation_coverage', 'risk_demonstrated_mitigation_coverage', 'impact_reduction_enabled', 'approval_max_steps', 'approval_max_approvers_per_step',
  'submitter_sole_approver_allowed', 'document_acceptance_days', 'document_acceptance_required', 'audited_period_min_months', 'score_threshold', 'solid_asset_coverage',
];

const restore = () => owner('update catalog.evaluation_parameters set value = default_value, updated_at = null, updated_by = null');
const auditRows = (key: string) =>
  owner<{ before_state: any; after_state: any; tenant_id: string | null; user_id: string | null; result: string }>(
    `select before_state, after_state, tenant_id, user_id, result from audit.audit_logs where action = 'catalog.evaluation_parameter.update' and after_state->>'key' = $1 order by created_at`,
    [key],
  );
const patch = (key: string, value: unknown) => monkey.patch(`${PATH}/${key}`).send({ value });

beforeAll(async () => {
  app = await bootApp();
  ({ a, monkey } = await dosEmpresas(app));
  await restore();
});
afterAll(async () => {
  await restore();
  await app?.close();
});

describe('GET /v1/catalog/evaluation-parameters', () => {
  it('lista los 19 parámetros en el orden del contrato, sin paginar, con su valor y el del libro', async () => {
    const res = await monkey.get(PATH).expect(200);
    const items = res.body.data.items;
    expect(items.map((i: any) => i.key)).toEqual(KEYS);
    expect(res.body.data.page).toBeUndefined();
    const byKey = Object.fromEntries(items.map((i: any) => [i.key, i]));
    expect(byKey.partial_threshold).toMatchObject({ code: 'PR-01', unit: 'percent', value: 75, default_value: 75, updated_at: null, updated_by: null });
    expect(byKey.alert_days_before).toMatchObject({ code: 'PR-06', unit: 'days_by_periodicity', value: ALERT });
    expect(byKey.validity_windows).toMatchObject({ code: 'PR-07', unit: 'window_mode', value: 'calendar' });
    expect(byKey.score_threshold).toMatchObject({ code: null, value: 80 });
    expect(byKey.solid_asset_coverage).toMatchObject({ code: null, value: 100 });
    expect(items.every((i: any) => i.is_editable === undefined)).toBe(true);
  });

  it('name y description salen traducidos según Accept-Language', async () => {
    const es = (await monkey.get(PATH).set('Accept-Language', 'es').expect(200)).body.data.items[0];
    const en = (await monkey.get(PATH).set('Accept-Language', 'en').expect(200)).body.data.items[0];
    expect(es.name).toContain('Umbral de Parcial');
    expect(en.name).toContain('Partial threshold');
    expect(es.description).not.toBe(en.description);
    expect(es.name).not.toMatch(/^evaluation_parameter\./);
  });

  it('solo admin_monkey: el administrador de una empresa recibe 403 y sin sesión, 401', async () => {
    await a.agent.get(PATH).expect(403);
    await a.agent.patch(`${PATH}/partial_threshold`).send({ value: 80 }).expect(403);
    await request(app.getHttpServer()).get(PATH).expect(401);
  });
});

describe('PATCH /v1/catalog/evaluation-parameters/{key}', () => {
  afterEach(restore);

  it('cambia el valor: 200 con el parámetro actualizado, quién y cuándo, y deja su rastro en la misma transacción', async () => {
    const res = await patch('score_threshold', 85).expect(200);
    expect(res.body.data).toMatchObject({ key: 'score_threshold', value: 85, default_value: 80, updated_by: { id: expect.any(String), name: expect.any(String) } });
    expect(res.body.data.updated_at).toEqual(expect.any(String));
    expect((await monkey.get(PATH).expect(200)).body.data.items.find((i: any) => i.key === 'score_threshold').value).toBe(85);
    const rows = await auditRows('score_threshold');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ before_state: { key: 'score_threshold', value: 80 }, after_state: { key: 'score_threshold', value: 85 }, tenant_id: null, user_id: res.body.data.updated_by.id, result: 'success' });
  });

  it('el mismo valor responde 200 sin cambio y sin fila de auditoría', async () => {
    const res = await patch('freshness_hours', 24).expect(200);
    expect(res.body.data).toMatchObject({ key: 'freshness_hours', value: 24, updated_at: null, updated_by: null });
    expect(await auditRows('freshness_hours')).toHaveLength(0);
  });

  it('cambia las 7 periodicidades de PR-06', async () => {
    const value = { ...ALERT, annual: 60, daily: 0 };
    expect((await patch('alert_days_before', value).expect(200)).body.data.value).toEqual(value);
  });

  it('una key que no existe es 404', async () => {
    const res = await patch('no_existe', 5).expect(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('todos son editables: PR-07 acepta rolling, PR-10 y PR-13 aceptan true y false', async () => {
    expect((await patch('validity_windows', 'rolling').expect(200)).body.data.value).toBe('rolling');
    await patch('validity_windows', 'calendar').expect(200);
    for (const key of ['impact_reduction_enabled', 'submitter_sole_approver_allowed']) {
      expect((await patch(key, true).expect(200)).body.data.value).toBe(true);
      expect((await patch(key, false).expect(200)).body.data.value).toBe(false);
    }
    expect((await auditRows('submitter_sole_approver_allowed')).map((r) => r.after_state.value)).toEqual([true, false]);
  });

  it('no los bloquea la transición del catálogo: el resto de la escritura sigue en 409 CATALOG_READ_ONLY y este PATCH responde 200', async () => {
    expect((await monkey.post('/v1/catalog/controls').send({}).expect(409)).body.error.code).toBe('CATALOG_READ_ONLY');
    await patch('score_threshold', 81).expect(200);
  });

  const field = (res: request.Response) => (res.body.error.fields as Array<{ field: string; code: string }>).map(({ field, code }) => ({ field, code }));
  it('sin value: 422 required', async () => {
    const res = await monkey.patch(`${PATH}/partial_threshold`).send({}).expect(422);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(field(res)).toEqual([{ field: 'value', code: 'required' }]);
  });

  const REJECTED: Array<{ code: string; key: string; value: unknown }> = [
    { code: 'value.type', key: 'partial_threshold', value: '80' },
    { code: 'value.type', key: 'partial_threshold', value: 80.5 },
    { code: 'value.type', key: 'approval_max_steps', value: true },
    { code: 'value.type', key: 'alert_days_before', value: 5 },
    { code: 'value.type', key: 'validity_windows', value: 'moving' },
    { code: 'value.type', key: 'impact_reduction_enabled', value: 'yes' },
    { code: 'value.range', key: 'partial_threshold', value: 101 },
    { code: 'value.range', key: 'asset_coverage', value: 0 },
    { code: 'value.range', key: 'check_exception_max_days', value: 366 },
    { code: 'value.range', key: 'freshness_hours', value: 721 },
    { code: 'value.range', key: 'on_demand_alert_days', value: 90 },
    { code: 'value.range', key: 'audited_period_min_months', value: 25 },
    { code: 'value.range', key: 'alert_days_before', value: { ...ALERT, weekly: 7 } },
    { code: 'value.order', key: 'partial_threshold', value: 40 },
    { code: 'value.order', key: 'weak_threshold', value: 75 },
    { code: 'value.order', key: 'risk_partial_mitigation_coverage', value: 85 },
    { code: 'value.order', key: 'risk_demonstrated_mitigation_coverage', value: 60 },
    { code: 'value.periodicities', key: 'alert_days_before', value: { daily: 0, weekly: 2 } },
    { code: 'value.periodicities', key: 'alert_days_before', value: { ...ALERT, permanent: 0 } },
  ];

  it.each(REJECTED)('$code: $key con $value responde 422', async ({ code, key, value }) => {
    const rows = (await auditRows(key)).length;
    const res = await patch(key, value).expect(422);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(field(res)).toEqual([{ field: 'value', code }]);
    expect(await auditRows(key)).toHaveLength(rows);
  });

  it('value.order: PR-03 no puede quedar por encima de la cobertura Sólido', async () => {
    await patch('asset_coverage', 90).expect(200);
    await patch('solid_asset_coverage', 90).expect(200);
    const res = await patch('asset_coverage', 95).expect(422);
    expect(field(res)).toEqual([{ field: 'value', code: 'value.order' }]);
  });

  it('las reglas entre parámetros miran el valor vigente del otro: para invertir un par se cambia primero el que lo deja válido', async () => {
    await patch('weak_threshold', 60).expect(200);
    await patch('partial_threshold', 55).expect(422);
    await patch('partial_threshold', 70).expect(200);
    await patch('solid_asset_coverage', 100).expect(200);
    await patch('asset_coverage', 90).expect(200);
    await patch('solid_asset_coverage', 85).expect(422);
  });
});

// Un control del catálogo con DOS requisitos y una sola prueba operativa en uno de ellos: aprobar el veredicto de esa prueba deja C% = 50 (el otro requisito sigue pendiente).
// El veredicto se inserta con su aprobación (como lo deja el admin_empresa que registra) para poder fecharlo: el motor lee `test_verdicts`.
async function controlYPrueba(code: string): Promise<{ control: string; test: string }> {
  const [row] = await owner<{ control: string; test: string }>(
    `select cc.id control, crt.test_id test from tenant.client_controls cc
       join catalog.controls c on c.id = cc.control_id
       join catalog.control_requirements r on r.control_id = c.id
       join catalog.control_requirement_tests crt on crt.control_requirement_id = r.id
       join catalog.tests t on t.id = crt.test_id and t.type in ('operational', 'population')
      where cc.service_id = $1 and cc.is_active and c.code = $2
        and (select count(*) from catalog.control_requirement_tests x where x.control_requirement_id = r.id) = 1
      order by t.code limit 1`,
    [a.serviceId, code],
  );
  return row;
}
async function veredicto(control: string, test: string, daysAgo: number): Promise<void> {
  const [{ id: userId }] = await owner<{ id: string }>('select id from platform.users where email = $1', [a.email]);
  const [{ id }] = await owner<{ id: string }>(
    `insert into tenant.test_verdicts (id, tenant_id, service_id, client_control_id, test_id, result, note, registered_by, registered_at)
     values (gen_random_uuid(), $1, $2, $3, $4, 'compliant', 'Revisión manual firmada.', $5, now() - ($6 || ' days')::interval) returning id`,
    [a.companyId, a.serviceId, control, test, userId, String(daysAgo)],
  );
  await owner(
    `insert into tenant.test_verdict_reviews (id, tenant_id, test_verdict_id, reviewer_role, decision, reviewed_by) values (gen_random_uuid(), $1, $2, 'admin_empresa', 'approve', $3)`,
    [a.companyId, id, userId],
  );
}
const technical = async (control: string) => (await a.agent.get(`/v1/controls/${control}?view=technical`).expect(200)).body.data.technical;

describe('El motor lee los parámetros de la tabla (RC-19)', () => {
  afterEach(restore);

  it('cambiar PR-01 cambia el nivel de un control en la siguiente lectura, y restaurarlo lo devuelve', async () => {
    const { control, test } = await controlYPrueba('GOB-3');
    await veredicto(control, test, 0);
    const before = await technical(control);
    expect(before).toMatchObject({ c_percent: 50, level: 'weak' });
    await patch('partial_threshold', 50).expect(200);
    expect(await technical(control)).toMatchObject({ c_percent: 50, level: 'partial' });
    await restore();
    expect((await technical(control)).level).toBe('weak');
  });
});

describe('PR-07 rolling en el motor', () => {
  afterEach(restore);

  it('con rolling una evidencia vale una periodicidad desde su fecha: vigente a los 10 días y vencida a los 40, con aviso previo; con calendar vuelve al calendario', async () => {
    const fresh = await controlYPrueba('CNT-3');
    const old = await controlYPrueba('GOB-2');
    for (const { control } of [fresh, old]) await a.agent.put(`/v1/controls/${control}/periodicity`).send({ periodicity: 'monthly', justification: 'Revisión mensual acordada con el auditor.' }).expect(200);
    await veredicto(fresh.control, fresh.test, 10);
    await veredicto(old.control, old.test, 40);
    const stateOf = async (c: { control: string; test: string }) => (await technical(c.control)).requirements.flatMap((r: any) => r.tests).find((t: any) => t.test_id === c.test);

    await patch('validity_windows', 'rolling').expect(200);
    const vigente = await stateOf(fresh);
    expect(vigente.status).toBe('correct');
    expect((await stateOf(old)).status).toBe('expired');
    expect(vigente.window_end).toEqual(expect.any(String));
    expect(vigente.alert_at).toEqual(expect.any(String));
    expect(new Date(vigente.alert_at).getTime()).toBeLessThan(new Date(vigente.window_end).getTime());

    // La vista del período: la evidencia de hace 40 días no se renovó, así que ya hubo un vencimiento sin evidencia.
    const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
    await definirPeriodo(a.serviceId, day(-120), day(60));
    expect((await technical(old.control)).period.missing.length).toBeGreaterThan(0);

    await patch('validity_windows', 'calendar').expect(200);
    expect((await stateOf(old)).status).toBe('expired');
  });
});
