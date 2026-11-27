import type { INestApplication } from '@nestjs/common';
import { Agent, bootApp, owner, RUN } from '../support/app';
import { asignarControl } from '../support/asignaciones';
import { idDe } from '../support/avisos';
import { invitarYActivar, sembrarEquipo } from '../support/equipo';
import { dosEmpresas, servicePayload, Tenant } from '../support/escenario';
import { ScanRepository } from '../../src/features/technical-control/domain/repositories/scan.repository';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { RollEvaluationPeriodsUseCase } from '../../src/features/compliance/application/periods/evaluation-period.use-cases';
import { ImportScanUseCase } from '../../src/features/technical-control/application/use-cases/scan.use-cases';

// MD-508 · D153 · Los avisos de la evaluación automática: `direct_check_failed` (nace en la transacción que cierra la recolección, comparada con la anterior del MISMO activo) y
// `automatic_evidence_stale` (la pasada diaria: última recolección más vieja que PR-05). Avisan el cambio, no el estado.
const ACCOUNT = '123456789012';
const CHECK = 'iam_root_mfa_enabled';
const OTRO = 'cloudtrail_multi_region_enabled';

let app: INestApplication;
let a: Tenant;
let b: Tenant;
let adminId: string;
let responsable: { id: string; session: Agent };
let delegado: { id: string; session: Agent };
let control: string; // un control de A con una prueba de nube cuyo vínculo Directo es CHECK
let equipo: string;
let minuto = 0;
const realInsert = auditInsert.insertAuditLog;
let n = 0;
const email = (k: string) => `${k}-${RUN}-${n++}@evaluacion-automatica.test`;

const fila = (checkId: string, status: 'PASS' | 'FAIL') => ({
  status_code: status,
  severity: 'High',
  status_detail: 'texto crudo del motor',
  metadata: { event_code: checkId },
  cloud: { region: 'us-east-1' },
  resources: [{ uid: `arn:aws:test:us-east-1:${ACCOUNT}:${checkId}`, type: 'Other', name: checkId }],
});
/** Una recolección completada del activo de A, cada una un minuto después de la anterior (a menos que se dé la hora). */
async function recolectar(resultados: Partial<Record<string, 'PASS' | 'FAIL'>>, finishedAt?: Date) {
  const fin = finishedAt ?? new Date(Date.UTC(2026, 10, 20, 10, minuto++, 0));
  return app.get(ImportScanUseCase).execute(
    { companyId: a.companyId },
    { assetId: a.assetId, origin: 'manual', actorUserId: null, startedAt: new Date(fin.getTime() - 60_000), finishedAt: fin, engineVersion: '5.44.0', regions: ['us-east-1'], raw: Object.entries(resultados).map(([c, s]) => fila(c, s!)) },
  );
}
const avisos = (companyId: string, type: string) =>
  owner<{ user_id: string; target_id: string; target_kind: string; dedupe_key: string; params: any }>(
    `select user_id, target_id, target_kind::text, dedupe_key, params from platform.notifications where company_id = $1 and type = $2::platform.notification_type order by dedupe_key, user_id`,
    [companyId, type],
  );
const deControl = (rows: Awaited<ReturnType<typeof avisos>>) => rows.filter((r) => r.target_id === control);
const limpiar = async () => {
  await owner('delete from platform.notifications where company_id = any($1::uuid[])', [[a.companyId, b.companyId]]);
  await owner('delete from tenant.exclusions where tenant_id = $1', [a.companyId]);
  await owner('delete from tenant.check_results where execution_id in (select id from tenant.executions where asset_id = $1)', [a.assetId]);
  await owner('delete from tenant.execution_logs where execution_id in (select id from tenant.executions where asset_id = $1)', [a.assetId]);
  await owner('delete from tenant.executions where asset_id = $1', [a.assetId]);
};

beforeAll(async () => {
  app = await bootApp();
  ({ a, b } = await dosEmpresas(app));
  adminId = await idDe(a.email);
  responsable = await invitarYActivar(app, a.agent, { email: email('resp'), name: 'Laura', last_name: 'Gómez', role: 'responsable' });
  equipo = await sembrarEquipo(a.companyId, responsable.id, `Equipo ${RUN}`);
  delegado = await invitarYActivar(app, a.agent, { email: email('del'), name: 'Juan', last_name: 'Pérez', role: 'delegado', group_id: equipo, is_internal: true });
  const [found] = await owner<{ id: string }>(
    `select distinct cc.id from tenant.client_controls cc
       join tenant.client_control_tests cct on cct.client_control_id = cc.id
       join catalog.test_checks tc on tc.test_id = cct.test_id and tc.role = 'direct' and tc.provenance = 'committee_ratified'
       join catalog.checks ck on ck.id = tc.check_id and ck.check_id = $2
      where cc.service_id = $1 and cc.is_active order by cc.id limit 1`,
    [a.serviceId, CHECK],
  );
  if (!found) throw new Error(`ningún control del servicio mide ${CHECK} como Directo`);
  control = found.id;
  await asignarControl(a.companyId, control, responsable.id, delegado.id);
});
afterAll(async () => {
  await limpiar();
  await app?.close();
});
afterEach(() => jest.restoreAllMocks());
beforeEach(async () => {
  await limpiar();
  minuto = 0;
});

describe('direct_check_failed · un check Directo pasa a FAIL (D153)', () => {
  it('la primera recolección del activo es la línea base: aunque falle, no avisa', async () => {
    await recolectar({ [CHECK]: 'FAIL', [OTRO]: 'FAIL' });
    expect(await avisos(a.companyId, 'direct_check_failed')).toEqual([]);
  });

  it('pasa de PASS a FAIL: avisa al ejecutor, al dueño y al administrador, un aviso por control y recolección', async () => {
    await recolectar({ [CHECK]: 'PASS' });
    const { executionId } = await recolectar({ [CHECK]: 'FAIL' });
    const rows = deControl(await avisos(a.companyId, 'direct_check_failed'));
    expect(rows.map((r) => r.user_id).sort()).toEqual([adminId, delegado.id, responsable.id].sort());
    expect(rows[0]).toMatchObject({ target_kind: 'control', dedupe_key: `direct_check_failed:${control}:${executionId}`, params: { service_id: a.serviceId, service_name: a.serviceName, failure_count: expect.any(Number) } });
    expect(rows[0].params.failures[0]).toMatchObject({ asset_name: a.assetName });
    expect(rows[0].params.failures.length).toBeLessThanOrEqual(5);
    expect(JSON.stringify(rows[0].params)).not.toMatch(/wazuh|prowler/i);
  });

  it('lo ve el ejecutor en su campana: título con el código del control, el activo y la verificación, sin proveedor ni códigos de prueba', async () => {
    await recolectar({ [CHECK]: 'PASS' });
    await recolectar({ [CHECK]: 'FAIL' });
    const items = (await delegado.session.get('/v1/me/notifications?type=direct_check_failed').expect(200)).body.data.items as any[];
    const item = items.find((i) => i.control?.id === control);
    expect(item.title).toMatch(/^[A-Z]+-\d+ · Una verificación automática del control pasó a fallar$/);
    expect(item.detail.what_happened).toContain(a.assetName);
    expect(item.detail.what_happened).toContain(`servicio ${a.serviceName}`);
    for (const campo of ['what_happened', 'why_it_matters', 'how_to_fix', 'who', 'time_needed', 'evidence', 'impact']) expect(typeof item.detail[campo]).toBe('string');
    expect(JSON.stringify(item)).not.toMatch(/wazuh|prowler|T-\d|test_code/i);
  });

  it('desde «sin dato» (el check no apareció en la recolección anterior) también avisa', async () => {
    await recolectar({ [OTRO]: 'PASS' });
    await recolectar({ [CHECK]: 'FAIL' });
    expect(deControl(await avisos(a.companyId, 'direct_check_failed')).length).toBe(3);
  });

  it('avisa el cambio, no el estado: lo que ya fallaba en la recolección anterior no vuelve a avisar', async () => {
    await recolectar({ [CHECK]: 'PASS' });
    await recolectar({ [CHECK]: 'FAIL' });
    const antes = (await avisos(a.companyId, 'direct_check_failed')).length;
    expect(antes).toBeGreaterThan(0);
    await recolectar({ [CHECK]: 'FAIL' });
    expect((await avisos(a.companyId, 'direct_check_failed')).length).toBe(antes);
  });

  it('si el check se corrige y vuelve a fallar, avisa de nuevo (otra recolección, otra clave)', async () => {
    await recolectar({ [CHECK]: 'PASS' });
    await recolectar({ [CHECK]: 'FAIL' });
    await recolectar({ [CHECK]: 'PASS' });
    await recolectar({ [CHECK]: 'FAIL' });
    expect(new Set(deControl(await avisos(a.companyId, 'direct_check_failed')).map((r) => r.dedupe_key)).size).toBe(2);
  });

  it('un FAIL con excepción vigente (PR-04) no avisa', async () => {
    await recolectar({ [CHECK]: 'PASS' });
    await owner(
      `insert into tenant.exclusions (id, tenant_id, service_id, test_id, asset_id, proposed_by, decided_by, status, requested_at, decided_at, justification, valid_from, valid_until)
       select gen_random_uuid(), $1, cc.service_id, cct.test_id, $3, $4, $4, 'approved', now(), now(), 'excepción de prueba', current_date - 1, current_date + 30
         from tenant.client_control_tests cct join tenant.client_controls cc on cc.id = cct.client_control_id
        where cc.service_id = $2 and cct.test_id in (select tc.test_id from catalog.test_checks tc join catalog.checks ck on ck.id = tc.check_id where ck.check_id = $5)`,
      [a.companyId, a.serviceId, a.assetId, adminId, CHECK],
    );
    await recolectar({ [CHECK]: 'FAIL' });
    expect(await avisos(a.companyId, 'direct_check_failed')).toEqual([]);
  });

  it('una excepción vencida no calla el aviso', async () => {
    await recolectar({ [CHECK]: 'PASS' });
    await owner(
      `insert into tenant.exclusions (id, tenant_id, service_id, test_id, asset_id, proposed_by, decided_by, status, requested_at, decided_at, justification, valid_from, valid_until)
       select gen_random_uuid(), $1, cc.service_id, cct.test_id, $3, $4, $4, 'approved', now(), now(), 'excepción de prueba', current_date - 60, current_date - 1
         from tenant.client_control_tests cct join tenant.client_controls cc on cc.id = cct.client_control_id
        where cc.service_id = $2 and cct.test_id in (select tc.test_id from catalog.test_checks tc join catalog.checks ck on ck.id = tc.check_id where ck.check_id = $5)`,
      [a.companyId, a.serviceId, a.assetId, adminId, CHECK],
    );
    await recolectar({ [CHECK]: 'FAIL' });
    expect(deControl(await avisos(a.companyId, 'direct_check_failed')).length).toBe(3);
  });

  it('una ejecución fallida (conexión) no es una falla de check: no avisa y la línea de comparación sigue siendo la última completada', async () => {
    await recolectar({ [CHECK]: 'PASS' });
    await owner(`insert into tenant.executions (id, tenant_id, asset_id, status, origin, kind, finished_at, failure_reason) values (gen_random_uuid(), $1, $2, 'failed', 'manual', 'assessment', now(), 'connection.timeout')`, [a.companyId, a.assetId]);
    expect(await avisos(a.companyId, 'direct_check_failed')).toEqual([]);
    await recolectar({ [CHECK]: 'FAIL' });
    expect(deControl(await avisos(a.companyId, 'direct_check_failed')).length).toBe(3);
  });

  it('si la recolección se revierte, el aviso también', async () => {
    await recolectar({ [CHECK]: 'PASS' });
    // El rastro de la recolección se escribe DESPUÉS de los avisos: si falla, la transacción entera se revierte.
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, e) => {
      await realInsert(db, e);
      throw new Error('audit_down');
    });
    await expect(recolectar({ [CHECK]: 'FAIL' })).rejects.toThrow('audit_down');
    expect(await avisos(a.companyId, 'direct_check_failed')).toEqual([]);
  });

  it('aislamiento (SEG-87): una persona de otra empresa no ve el aviso, ni otra persona de la misma que no es destinataria', async () => {
    await recolectar({ [CHECK]: 'PASS' });
    await recolectar({ [CHECK]: 'FAIL' });
    expect(((await b.agent.get('/v1/me/notifications?type=direct_check_failed').expect(200)).body.data.items as any[]).length).toBe(0);
    expect(await avisos(b.companyId, 'direct_check_failed')).toEqual([]);
    const otro = await invitarYActivar(app, a.agent, { email: email('otro'), name: 'Otra', last_name: 'Persona', role: 'delegado', group_id: equipo, is_internal: true });
    expect(((await otro.session.get('/v1/me/notifications?type=direct_check_failed').expect(200)).body.data.items as any[]).length).toBe(0);
  });
});

describe('automatic_evidence_stale · la última recolección supera PR-05 (D153)', () => {
  const pasada = (now: Date) => app.get(RollEvaluationPeriodsUseCase).execute(now);
  const AHORA = new Date('2026-11-25T12:00:00Z');

  it('una recolección de hace 5 días avisa al ejecutor y al dueño del control, no al administrador', async () => {
    await recolectar({ [CHECK]: 'PASS' }, new Date('2026-11-20T10:00:00Z'));
    await pasada(AHORA);
    const rows = deControl(await avisos(a.companyId, 'automatic_evidence_stale'));
    expect(rows.map((r) => r.user_id).sort()).toEqual([delegado.id, responsable.id].sort());
    expect(rows[0]).toMatchObject({ target_kind: 'control', params: { service_name: a.serviceName, stale_count: 1, stale_assets: [{ name: a.assetName, last_collected_at: '2026-11-20T10:00:00.000Z' }] } });
    expect(rows[0].dedupe_key).toMatch(new RegExp(`^automatic_evidence_stale:${control}:[0-9a-f]{24}$`));
  });

  it('lo ve el ejecutor con el activo y la fecha de su última lectura', async () => {
    await recolectar({ [CHECK]: 'PASS' }, new Date('2026-11-20T10:00:00Z'));
    await pasada(AHORA);
    const item = ((await delegado.session.get('/v1/me/notifications?type=automatic_evidence_stale').expect(200)).body.data.items as any[]).find((i) => i.control?.id === control);
    expect(item.title).toMatch(/^[A-Z]+-\d+ · La evidencia automática del control está desactualizada$/);
    expect(item.detail.what_happened).toContain(`${a.assetName} (última lectura: 20/11/2026)`);
    expect(JSON.stringify(item)).not.toMatch(/wazuh|prowler|T-\d|test_code/i);
  });

  it('una recolección fresca no avisa', async () => {
    await recolectar({ [CHECK]: 'PASS' }, new Date('2026-11-25T11:00:00Z'));
    await pasada(AHORA);
    expect(await avisos(a.companyId, 'automatic_evidence_stale')).toEqual([]);
  });

  it('un activo sin ninguna recolección está sin datos, no desactualizado', async () => {
    await pasada(AHORA);
    expect(await avisos(a.companyId, 'automatic_evidence_stale')).toEqual([]);
  });

  it('no se repite: la pasada del día siguiente (misma recolección) no duplica; una recolección fresca que envejece sí avisa', async () => {
    await recolectar({ [CHECK]: 'PASS' }, new Date('2026-11-20T10:00:00Z'));
    await pasada(AHORA);
    const primero = (await avisos(a.companyId, 'automatic_evidence_stale')).length;
    expect(primero).toBeGreaterThan(0);
    await pasada(new Date('2026-11-25T18:00:00Z'));
    await pasada(new Date('2026-11-26T12:00:00Z'));
    expect((await avisos(a.companyId, 'automatic_evidence_stale')).length).toBe(primero);
    await recolectar({ [CHECK]: 'PASS' }, new Date('2026-11-26T13:00:00Z'));
    await pasada(new Date('2026-11-26T14:00:00Z'));
    expect((await avisos(a.companyId, 'automatic_evidence_stale')).length).toBe(primero);
    await pasada(new Date('2026-11-28T12:00:00Z'));
    expect((await avisos(a.companyId, 'automatic_evidence_stale')).length).toBeGreaterThan(primero);
  });

  it('aislamiento: la empresa B no recibe nada de la recolección de A', async () => {
    await recolectar({ [CHECK]: 'PASS' }, new Date('2026-11-20T10:00:00Z'));
    await pasada(AHORA);
    expect(await avisos(b.companyId, 'automatic_evidence_stale')).toEqual([]);
    expect(((await b.agent.get('/v1/me/notifications?type=automatic_evidence_stale').expect(200)).body.data.items as any[]).length).toBe(0);
  });
});

// MD-508 · La ruta de la sonda de un servidor (`completeSca`, `source: 'sca'`): los checks se identifican por su id del catálogo y no hay recursos. Misma regla: avisa el cambio, no la línea base.
describe('direct_check_failed · la ruta de la sonda (SCA)', () => {
  let probe: { control: string; test: string; check: string; platform: string; policy: string; raw: string };
  let minutoSca = 0;
  const lectura = async (result: 'passed' | 'failed') => {
    const fin = new Date(Date.UTC(2026, 10, 21, 10, minutoSca++, 0));
    const [{ id }] = await owner<{ id: string }>(
      `insert into tenant.executions (id, tenant_id, asset_id, status, origin, kind, started_at) values (gen_random_uuid(), $1, $2, 'running', 'manual', 'assessment', $3) returning id`,
      [a.companyId, a.assetId, new Date(fin.getTime() - 60_000)],
    );
    const row = { checkId: probe.check, platform: probe.platform, policyId: probe.policy, rawCheckId: probe.raw, result, evaluatedAt: fin, statusDetail: null };
    return app.get(ScanRepository).completeSca(
      { companyId: a.companyId },
      id,
      { agentId: 'agente-de-prueba', finishedAt: fin, sondaVersion: '4.9.0', checksExecuted: 1, rows: [row], logs: [] },
      (r) => ({ tenantId: a.companyId, userId: null, action: 'execution.complete', resource: 'execution', result: 'success', ipAddress: '', userAgent: 'jest', afterState: { execution_id: r.executionId, source: 'sca' } }),
    );
  };

  beforeAll(async () => {
    const [found] = await owner<{ control: string; test: string; check: string; platform: string; policy: string; raw: string }>(
      `select cct.client_control_id control, cct.test_id test, ck.id check, ck.platform, ck.policy_id policy, ck.check_id raw
         from tenant.client_control_tests cct
         join tenant.client_controls cc on cc.id = cct.client_control_id and cc.service_id = $1 and cc.is_active
         join catalog.tests t on t.id = cct.test_id and t.dimension = 'server'
         join catalog.test_checks tc on tc.test_id = t.id and tc.role = 'direct' and tc.provenance = 'committee_ratified' and tc.check_id is not null
         join catalog.checks ck on ck.id = tc.check_id
        order by cc.id, ck.id limit 1`,
      [a.serviceId],
    );
    if (!found) throw new Error('ningún control del servicio mide un check Directo de la sonda');
    probe = found;
    await asignarControl(a.companyId, probe.control, responsable.id, delegado.id);
  });
  beforeEach(() => {
    minutoSca = 0;
  });

  it('la primera lectura es la línea base; pasar de PASS a FAIL avisa al ejecutor, al dueño y al administrador, una vez por lectura', async () => {
    await lectura('failed');
    expect(await avisos(a.companyId, 'direct_check_failed')).toEqual([]);
    await lectura('passed');
    const { executionId } = await lectura('failed');
    const rows = (await avisos(a.companyId, 'direct_check_failed')).filter((r) => r.target_id === probe.control);
    expect(rows.map((r) => r.user_id).sort()).toEqual([adminId, delegado.id, responsable.id].sort());
    expect(rows[0].dedupe_key).toBe(`direct_check_failed:${probe.control}:${executionId}`);
    expect(JSON.stringify(rows[0].params)).not.toMatch(/wazuh|prowler/i);
    await lectura('failed');
    expect((await avisos(a.companyId, 'direct_check_failed')).filter((r) => r.target_id === probe.control).length).toBe(3);
  });
});

// MD-508 · El alcance por servicio: un recurso con activo propio que NO es de un servicio no se mide para él (misma regla que las evaluaciones, D90). Un FAIL de ese recurso no avisa al control de OTRO servicio.
describe('direct_check_failed · dos servicios y un recurso con activo propio', () => {
  let segundo: string;
  let controlSegundo: string;

  beforeAll(async () => {
    segundo = (await a.agent.post('/v1/services').send(servicePayload(`Segundo ${RUN}`)).expect(201)).body.data.id;
    const [c2] = await owner<{ id: string }>(
      `select distinct cc.id from tenant.client_controls cc
         join tenant.client_control_tests cct on cct.client_control_id = cc.id
         join catalog.test_checks tc on tc.test_id = cct.test_id and tc.role = 'direct' and tc.provenance = 'committee_ratified'
         join catalog.checks ck on ck.id = tc.check_id and ck.check_id = $2
        where cc.service_id = $1 and cc.is_active order by cc.id limit 1`,
      [segundo, CHECK],
    );
    if (!c2) throw new Error(`el segundo servicio no mide ${CHECK}`);
    controlSegundo = c2.id;
    // La cuenta de nube también mide el segundo servicio.
    await owner('insert into tenant.service_assets (id, tenant_id, asset_id, service_id) values (gen_random_uuid(), $1, $2, $3)', [a.companyId, a.assetId, segundo]);
  });
  afterAll(async () => {
    await limpiar();
    // Primero los vínculos del activo hijo (a CUALQUIER servicio: el caso inverso lo vincula también al primero) y los del segundo servicio; después el activo.
    await owner('delete from tenant.service_assets where service_id = $1 or asset_id in (select id from tenant.assets where parent_asset_id = $2)', [segundo, a.assetId]);
    // D160 · El recurso con activo propio ya lleva su propia evaluación, que es inmutable: el activo se da de baja y se suelta de su recurso (como en producción, D61 punto 4), no se borra.
    await owner(`update tenant.assets set status = 'inactive', resource_id = null where parent_asset_id = $1`, [a.assetId]);
  });

  it('un FAIL de un recurso cuyo activo es solo del segundo servicio avisa al control del segundo y NO al del primero', async () => {
    await recolectar({ [CHECK]: 'PASS' });
    const [resource] = await owner<{ id: string }>('select id from tenant.asset_resources where asset_id = $1 and resource_uid like $2', [a.assetId, `%:${CHECK}`]);
    await owner(
      `insert into tenant.assets (id, tenant_id, organization_id, code, connection_category, type, name, platform, criticality, tags, origin, status, technical_coverage, parent_asset_id, resource_id)
       select gen_random_uuid(), tenant_id, organization_id, 'AST-HIJO-' || $3, connection_category, 'server', 'hijo-' || $3, platform, criticality, tags, origin, 'active', technical_coverage, id, $2 from tenant.assets where id = $1`,
      [a.assetId, resource.id, RUN],
    );
    await owner(`insert into tenant.service_assets (id, tenant_id, asset_id, service_id) select gen_random_uuid(), $1, id, $2 from tenant.assets where parent_asset_id = $3`, [a.companyId, segundo, a.assetId]);
    await recolectar({ [CHECK]: 'FAIL' });
    const rows = await avisos(a.companyId, 'direct_check_failed');
    // El segundo control no tiene dueño ni ejecutor: avisa a los administradores (aquí, uno).
    expect(rows.filter((r) => r.target_id === controlSegundo).map((r) => r.user_id)).toEqual([adminId]);
    expect(rows.filter((r) => r.target_id === control)).toEqual([]);
    // D160 · El recurso elegido lleva su PROPIA evaluación en el servicio que lo eligió (no cumple), y ninguna en el otro; la de la cuenta ya no carga con ese fallo.
    const evaluations = await owner<{ service_id: string; own: boolean; result: string }>(
      `select distinct on (e.service_id, e.asset_id) e.service_id, (e.asset_id <> $1) as own, e.result::text as result
         from tenant.evaluations e join tenant.assets x on x.id = e.asset_id
        where (x.id = $1 or x.parent_asset_id = $1) and e.client_control_id = any($2::uuid[]) and e.test_id in (select tc.test_id from catalog.test_checks tc join catalog.checks ck on ck.id = tc.check_id where ck.check_id = $3 and tc.role = 'direct')
        order by e.service_id, e.asset_id, e.evaluated_at desc, e.id desc`,
      [a.assetId, [control, controlSegundo], CHECK],
    );
    expect(evaluations.filter((e) => e.own)).toEqual([{ service_id: segundo, own: true, result: 'non_compliant' }]);
    expect(evaluations.filter((e) => !e.own && e.result === 'non_compliant')).toEqual([]);
  });

  it('el caso inverso: un activo hijo vinculado a los dos servicios avisa a los controles de ambos', async () => {
    await owner(`insert into tenant.service_assets (id, tenant_id, asset_id, service_id) select gen_random_uuid(), $1, id, $2 from tenant.assets where parent_asset_id = $3 on conflict do nothing`, [a.companyId, a.serviceId, a.assetId]);
    await recolectar({ [CHECK]: 'PASS' });
    await recolectar({ [CHECK]: 'FAIL' });
    const rows = await avisos(a.companyId, 'direct_check_failed');
    expect(rows.filter((r) => r.target_id === controlSegundo).map((r) => r.user_id)).toEqual([adminId]);
    expect(rows.filter((r) => r.target_id === control).map((r) => r.user_id).sort()).toEqual([adminId, delegado.id, responsable.id].sort());
  });
});
