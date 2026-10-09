import type { INestApplication } from '@nestjs/common';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import {
  ClaimExecutionUseCase,
  CompleteExecutionUseCase,
  FailExecutionUseCase,
  GetAssetReadinessUseCase,
  ImportScanUseCase,
  ListExecutionsUseCase,
  QueueExecutionUseCase,
} from '../../src/features/technical-control/application/use-cases/scan.use-cases';
import { bootApp, owner, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// D56, D57: una corrida de la sonda de nube se guarda entera o no se guarda (con su rastro, SEG-36), vive bajo RLS, sigue un ciclo de vida
// (en cola → en curso → completada o fallida) y de ella se deriva el estado de preparación. Los checks usados existen en el catálogo real;
// aquí solo se aseguran por si la base no trae el seed de nube.
const CHECKS = [
  { id: 'iam_root_mfa_enabled', test: 'T-CLD-001' },
  { id: 'ec2_securitygroup_allow_ingress_from_internet_to_tcp_port_22', test: 'T-CLD-002' },
  { id: 'cloudtrail_multi_region_enabled', test: 'T-CLD-003' },
];
const ACCOUNT = '123456789012';
const ROLE_ARN = `arn:aws:iam::${ACCOUNT}:role/MonkeyReadOnly`;

let app: INestApplication;
let a: Tenant;
let b: Tenant;
let aUserId: string;
let queue: QueueExecutionUseCase;
let list: ListExecutionsUseCase;
let readiness: GetAssetReadinessUseCase;
let importScan: ImportScanUseCase;
let claim: ClaimExecutionUseCase;
let complete: CompleteExecutionUseCase;
let fail: FailExecutionUseCase;
const realInsert = auditInsert.insertAuditLog;

// Una fila con la forma de la salida del motor (OCSF), que es lo que entrega el trabajador.
const row = (checkId: string, over: { status?: string; severity?: string; region?: string; uid?: string; type?: string } = {}) => ({
  status_code: over.status ?? 'PASS',
  severity: over.severity ?? 'Medium',
  status_detail: 'texto crudo del motor',
  metadata: { event_code: checkId },
  cloud: { region: over.region ?? 'us-east-1' },
  resources: [{ uid: over.uid ?? `arn:aws:test:${over.region ?? 'us-east-1'}:${ACCOUNT}:${checkId}`, type: over.type ?? 'Other', name: checkId }],
});
const SG = `arn:aws:ec2:us-east-1:${ACCOUNT}:security-group/sg-1`;
const failing = () => [
  row(CHECKS[0].id),
  row(CHECKS[1].id, { status: 'FAIL', severity: 'High', uid: SG, type: 'AwsEc2SecurityGroup' }),
  row(CHECKS[2].id, { status: 'MANUAL' }),
];
const allPass = () => CHECKS.map((c) => row(c.id, c.id === CHECKS[1].id ? { uid: SG, type: 'AwsEc2SecurityGroup' } : {}));

const principal = (t: Tenant, userId: string) => ({ userId, companyId: t.companyId, role: 'admin_empresa' as const, sessionId: 's' });
const meta = { ipAddress: '10.0.0.1', userAgent: 'jest' };
const count = (sql: string, params: unknown[]) => owner<{ n: number }>(sql, params).then((r) => r[0].n);
const importArgs = (assetId: string, raw: unknown, over: Record<string, unknown> = {}) => ({
  assetId,
  origin: 'manual' as const,
  actorUserId: null,
  startedAt: new Date('2026-10-09T10:00:00Z'),
  finishedAt: new Date('2026-10-09T10:02:00Z'),
  engineVersion: '5.44.0',
  regions: ['us-east-1'],
  raw,
  ...over,
});

/** Un activo de nube con conexión ya validada, creado por la API real (el formulario provisional del paso 3). */
async function cloudAsset(t: Tenant, name: string, credentials: Record<string, string>, extra: Record<string, unknown> = {}): Promise<string> {
  const res = await t.agent.post('/v1/assets').send({ name, connection_category: 'ac_01', platform: 'AWS', service_ids: [t.serviceId], credentials, ...extra });
  if (res.status !== 201) throw new Error(`activo de nube: ${res.status} ${JSON.stringify(res.body)}`);
  const v = await t.agent.post(`/v1/assets/${res.body.data.id}/validate`);
  if (v.status !== 200) throw new Error(`validar: ${v.status} ${JSON.stringify(v.body)}`);
  return res.body.data.id;
}
/** Las regiones declaradas viven en el aprovisionamiento (D53); aún no hay endpoint que las fije, así que se preparan como dueño. */
const declareRegions = (assetId: string, regions: string[]) => owner('update tenant.asset_provisionings set regions = $2 where asset_id = $1', [assetId, regions]);
/** Deja la cola vacía: el reclamo busca entre todas las empresas y otras corridas de prueba no deben interferir. */
const drainQueue = () => owner(`update tenant.executions set status = 'failed', finished_at = now(), failure_reason = 'test.cleanup' where status in ('queued', 'running')`);

beforeAll(async () => {
  app = await bootApp();
  ({ a, b } = await dosEmpresas(app));
  queue = app.get(QueueExecutionUseCase);
  list = app.get(ListExecutionsUseCase);
  readiness = app.get(GetAssetReadinessUseCase);
  importScan = app.get(ImportScanUseCase);
  claim = app.get(ClaimExecutionUseCase);
  complete = app.get(CompleteExecutionUseCase);
  fail = app.get(FailExecutionUseCase);
  aUserId = (await owner<{ id: string }>('select id from platform.users where email = $1', [a.email]))[0].id;
  for (const c of CHECKS) {
    await owner(
      `insert into catalog.checks (id, platform, policy_id, check_id, title_en, condition, remediation, origin, mapping_provenance, mapping_confidence)
       values (gen_random_uuid(), 'aws', 'cloud_configuration', $1, 't', 'c', 'r', 'engine_native', 'test', 'low') on conflict do nothing`,
      [c.id],
    );
    await owner(
      `insert into catalog.test_checks (id, test_id, check_id)
       select gen_random_uuid(), t.id, ch.id from catalog.tests t, catalog.checks ch
       where t.code = $1 and ch.platform = 'aws' and ch.policy_id = 'cloud_configuration' and ch.check_id = $2 on conflict do nothing`,
      [c.test, c.id],
    );
  }
});
afterAll(async () => {
  await drainQueue();
  await app?.close();
});
afterEach(() => jest.restoreAllMocks());

describe('Importar una corrida: se guarda y se lee bajo RLS', () => {
  let assetId: string;
  let executionId: string;
  beforeAll(async () => {
    assetId = await cloudAsset(a, `aws-import-${RUN}`, { account_id: ACCOUNT, read_only_role: ROLE_ARN });
  });

  it('guarda ejecución, recursos y resultados, y NO guarda los checks sin filas', async () => {
    const out = await importScan.execute({ companyId: a.companyId }, importArgs(assetId, failing()));
    executionId = out.executionId;
    expect(out).toMatchObject({ resultCount: 3, resourceCount: 3 });
    expect(await count('select count(*)::int n from tenant.check_results where execution_id = $1', [executionId])).toBe(3);
    expect(await count(`select count(*)::int n from tenant.check_results where execution_id = $1 and result = 'not_applicable'`, [executionId])).toBe(0);
    expect(await count('select count(*)::int n from tenant.asset_resources where asset_id = $1', [assetId])).toBe(3);
    const [ex] = await owner<{ status: string; engine_version: string; checks_executed: number; regions: string[] }>('select status, engine_version, checks_executed, regions from tenant.executions where id = $1', [executionId]);
    expect(ex).toMatchObject({ status: 'completed', engine_version: '5.44.0', regions: ['us-east-1'] });
    expect(ex.checks_executed).toBeGreaterThanOrEqual(3);
  });

  it('deja exactamente un rastro de la corrida, con su empresa', async () => {
    const rows = await owner<{ after_state: Record<string, unknown> }>(`select after_state from audit.audit_logs where tenant_id = $1 and action = 'execution.complete' and after_state->>'execution_id' = $2`, [a.companyId, executionId]);
    expect(rows).toHaveLength(1);
    expect(rows[0].after_state).toMatchObject({ asset_id: assetId, results: 3 });
  });

  it('MANUAL queda not_run y la falla alta lleva a «Requiere trabajo» (R-05, R-06)', async () => {
    const out = await readiness.execute({ companyId: a.companyId }, assetId, { includeProposed: true });
    expect(out!.readiness).toBe('needs_work');
    expect(out!.needsManualReview).toBe(1);
    expect(out!.ofMeasured).toEqual({ compliant: 1, notCompliant: 1 });
  });

  it('en modo producción, sin mapeos ratificados, no cuenta nada: «Sin medir», no un fallo', async () => {
    expect((await readiness.execute({ companyId: a.companyId }, assetId, { includeProposed: false }))!.readiness).toBe('not_measured');
  });

  it('otra empresa no ve la corrida ni puede escribir sobre el activo (RLS)', async () => {
    await expect(readiness.execute({ companyId: b.companyId }, assetId, { includeProposed: true })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(importScan.execute({ companyId: b.companyId }, importArgs(assetId, failing()))).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(await count('select count(*)::int n from tenant.executions where asset_id = $1', [assetId])).toBe(1);
  });

  it('una segunda corrida reutiliza los recursos y la lectura usa la última', async () => {
    await importScan.execute({ companyId: a.companyId }, importArgs(assetId, allPass(), { finishedAt: new Date('2026-10-09T11:00:00Z') }));
    expect(await count('select count(*)::int n from tenant.asset_resources where asset_id = $1', [assetId])).toBe(3);
    expect((await readiness.execute({ companyId: a.companyId }, assetId, { includeProposed: true }))!.readiness).toBe('ready');
  });

  it('si el rastro falla DESPUÉS de insertarse, no queda ni la ejecución, ni los resultados, ni los recursos', async () => {
    const before = await count('select count(*)::int n from tenant.executions where asset_id = $1', [assetId]);
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, e) => {
      await realInsert(db, e);
      throw new Error('audit_down');
    });
    const uid = `arn:aws:test:us-east-1:${ACCOUNT}:rollback-${RUN}`;
    await expect(importScan.execute({ companyId: a.companyId }, importArgs(assetId, [row(CHECKS[0].id, { uid })]))).rejects.toThrow('audit_down');
    expect(await count('select count(*)::int n from tenant.executions where asset_id = $1', [assetId])).toBe(before);
    expect(await count('select count(*)::int n from tenant.asset_resources where resource_uid = $1', [uid])).toBe(0);
  });

  it('la misma configuración en dos regiones es UNA evaluación sin región (D53) y manda la peor', async () => {
    const uid = (r: string) => `arn:aws:test:${r}:${ACCOUNT}:logging-${RUN}`;
    const out = await importScan.execute(
      { companyId: a.companyId },
      importArgs(assetId, [row(CHECKS[2].id, { region: 'us-east-1', uid: uid('us-east-1') }), row(CHECKS[2].id, { region: 'us-east-2', uid: uid('us-east-2'), status: 'FAIL', severity: 'High' })], { regions: ['us-east-1', 'us-east-2'] }),
    );
    expect(await owner('select result, region from tenant.check_results where execution_id = $1', [out.executionId])).toEqual([{ result: 'failed', region: null }]);
  });

  it('una salida mal formada se rechaza diciendo cuál fila y no guarda nada', async () => {
    const before = await count('select count(*)::int n from tenant.executions where asset_id = $1', [assetId]);
    await expect(importScan.execute({ companyId: a.companyId }, importArgs(assetId, [row(CHECKS[0].id), { metadata: {} }]))).rejects.toMatchObject({ code: 'ENGINE_OUTPUT_INVALID', details: { reason: expect.stringContaining('Hallazgo 1') } });
    expect(await count('select count(*)::int n from tenant.executions where asset_id = $1', [assetId])).toBe(before);
  });
});

describe('Ciclo de vida: en cola → en curso → completada o fallida (D57)', () => {
  let assetId: string;
  beforeAll(async () => {
    assetId = await cloudAsset(a, `aws-ciclo-${RUN}`, { account_id: ACCOUNT, read_only_role: ROLE_ARN, external_id: `mk-${RUN}` });
    await declareRegions(assetId, ['us-east-1', 'us-east-2']);
  });
  beforeEach(drainQueue);

  it('«evaluar ahora» deja una ejecución en cola, con su rastro, sin esperar al motor', async () => {
    const { executionId } = await queue.execute(principal(a, aUserId), assetId, meta);
    const [ex] = await owner<{ status: string; started_at: Date | null }>('select status, started_at from tenant.executions where id = $1', [executionId]);
    expect(ex).toEqual({ status: 'queued', started_at: null });
    const rows = await owner<{ user_id: string }>(`select user_id from audit.audit_logs where tenant_id = $1 and action = 'execution.queue' and after_state->>'execution_id' = $2`, [a.companyId, executionId]);
    expect(rows).toEqual([{ user_id: aUserId }]);
    expect((await list.execute(principal(a, aUserId), assetId, { page: 1, pageSize: 25 })).items.map((e) => e.status)).toContain('queued');
  });

  it('no se puede abrir una segunda mientras hay una abierta, ni siquiera dos a la vez (índice único parcial)', async () => {
    const results = await Promise.allSettled([queue.execute(principal(a, aUserId), assetId, meta), queue.execute(principal(a, aUserId), assetId, meta), queue.execute(principal(a, aUserId), assetId, meta)]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    for (const r of results.filter((x) => x.status === 'rejected')) expect((r as PromiseRejectedResult).reason).toMatchObject({ code: 'EXECUTION_IN_PROGRESS' });
  });

  it('un activo cuya conexión no se validó, o de otra empresa, no se puede evaluar', async () => {
    const res = await a.agent.post('/v1/assets').send({ name: `aws-sin-validar-${RUN}`, connection_category: 'ac_01', platform: 'AWS', service_ids: [a.serviceId], credentials: { account_id: ACCOUNT, read_only_role: ROLE_ARN } });
    await expect(queue.execute(principal(a, aUserId), res.body.data.id, meta)).rejects.toMatchObject({ code: 'ASSET_NOT_VALIDATED' });
    await expect(queue.execute(principal(b, aUserId), assetId, meta)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('el trabajador reclama la ejecución de cualquier empresa y recibe solo lo necesario para esa corrida', async () => {
    const { executionId } = await queue.execute(principal(a, aUserId), assetId, meta);
    const job = await claim.execute();
    expect(job).toMatchObject({
      executionId,
      tenantId: a.companyId,
      assetId,
      platform: 'aws',
      externalAccountId: ACCOUNT,
      regions: ['us-east-1', 'us-east-2'],
      connection: { method: 'readonly_role', roleArn: ROLE_ARN, externalId: `mk-${RUN}` },
    });
    const [ex] = await owner<{ status: string; started_at: Date | null }>('select status, started_at from tenant.executions where id = $1', [executionId]);
    expect(ex.status).toBe('running');
    expect(ex.started_at).not.toBeNull();
    expect(await claim.execute()).toBeNull();
  });

  it('completar una ejecución en curso guarda la corrida; hacerlo dos veces, o con otra empresa, falla', async () => {
    const { executionId } = await queue.execute(principal(a, aUserId), assetId, meta);
    await claim.execute();
    const input = { engineVersion: '5.44.0', regions: ['us-east-1'], finishedAt: new Date(), raw: failing() };
    await expect(complete.execute(b.companyId, executionId, input)).rejects.toMatchObject({ code: 'EXECUTION_NOT_RUNNING' });
    const out = await complete.execute(a.companyId, executionId, input);
    expect(out).toMatchObject({ executionId, resultCount: 3 });
    const [ex] = await owner<{ status: string; progress_percentage: number }>('select status, progress_percentage from tenant.executions where id = $1', [executionId]);
    expect(ex).toEqual({ status: 'completed', progress_percentage: 100 });
    await expect(complete.execute(a.companyId, executionId, input)).rejects.toMatchObject({ code: 'EXECUTION_NOT_RUNNING' });
    expect((await readiness.execute({ companyId: a.companyId }, assetId, { includeProposed: true }))!.executionId).toBe(executionId);
  });

  it('una corrida fallida es un problema de conexión: no guarda resultados ni mueve la preparación', async () => {
    const before = (await readiness.execute({ companyId: a.companyId }, assetId, { includeProposed: true }))!.executionId;
    const { executionId } = await queue.execute(principal(a, aUserId), assetId, meta);
    await claim.execute();
    await fail.execute(a.companyId, executionId, 'connection.role_not_found');
    const [ex] = await owner<{ status: string; failure_reason: string }>('select status, failure_reason from tenant.executions where id = $1', [executionId]);
    expect(ex).toEqual({ status: 'failed', failure_reason: 'connection.role_not_found' });
    expect(await count('select count(*)::int n from tenant.check_results where execution_id = $1', [executionId])).toBe(0);
    expect((await readiness.execute({ companyId: a.companyId }, assetId, { includeProposed: true }))!.executionId).toBe(before);
    // y el activo queda libre para evaluar de nuevo
    await expect(queue.execute(principal(a, aUserId), assetId, meta)).resolves.toBeDefined();
  });

  it('una conexión que no sirve (sin regiones declaradas) se cierra como fallida y no se entrega al trabajador', async () => {
    const sinRegiones = await cloudAsset(a, `aws-sin-regiones-${RUN}`, { account_id: ACCOUNT, read_only_role: ROLE_ARN });
    const { executionId } = await queue.execute(principal(a, aUserId), sinRegiones, meta);
    expect(await claim.execute()).toBeNull();
    const [ex] = await owner<{ status: string; failure_reason: string }>('select status, failure_reason from tenant.executions where id = $1', [executionId]);
    expect(ex).toEqual({ status: 'failed', failure_reason: 'connection.regions_missing' });
  });

  it('una conexión de llaves sin llaves guardadas falla en voz alta, y ningún secreto queda en el rastro', async () => {
    const keys = await cloudAsset(a, `aws-llaves-${RUN}`, { account_id: ACCOUNT, read_only_role: ROLE_ARN });
    await owner(`update tenant.asset_provisionings set regions = array['us-east-1'], connection_method = 'access_keys' where asset_id = $1`, [keys]);
    // el formulario provisional no guarda llaves: la conexión de llaves sin ellas falla en voz alta
    const { executionId } = await queue.execute(principal(a, aUserId), keys, meta);
    expect(await claim.execute()).toBeNull();
    const [ex] = await owner<{ failure_reason: string }>('select failure_reason from tenant.executions where id = $1', [executionId]);
    expect(ex.failure_reason).toBe('connection.credentials_invalid');
    const audit = await owner<{ s: string }>(`select (before_state::text || after_state::text) s from audit.audit_logs where tenant_id = $1 and action like 'execution.%'`, [a.companyId]);
    expect(audit.every((r) => !/secret|AKIA|password|encrypted/i.test(r.s ?? ''))).toBe(true);
  });

  it('una ejecución que lleva más de 30 minutos en curso se barre como fallida al reclamar', async () => {
    const { executionId } = await queue.execute(principal(a, aUserId), assetId, meta);
    await claim.execute();
    await owner(`update tenant.executions set started_at = now() - interval '31 minutes' where id = $1`, [executionId]);
    expect(await claim.execute()).toBeNull();
    const [ex] = await owner<{ status: string; failure_reason: string }>('select status, failure_reason from tenant.executions where id = $1', [executionId]);
    expect(ex).toEqual({ status: 'failed', failure_reason: 'execution.timed_out' });
    expect(await count(`select count(*)::int n from tenant.execution_logs where execution_id = $1 and message = 'execution.timed_out'`, [executionId])).toBe(1);
  });

  it('la función de reclamo solo la ejecuta la app (SEG-47): no PUBLIC, y no fija el search_path del llamante', async () => {
    const [fn] = await owner<{ acl: string; secdef: boolean; cfg: string[] }>(`select proacl::text acl, prosecdef secdef, proconfig cfg from pg_proc where proname = 'claim_next_execution'`);
    expect(fn.secdef).toBe(true);
    expect(fn.cfg).toEqual(['search_path=tenant, pg_temp']);
    expect(fn.acl).toContain('monkey_app=X/');
    expect(fn.acl).not.toMatch(/(^\{|,)=X\//);
  });
});

describe('El estado de preparación de un servicio mide solo sus activos (D61)', () => {
  let assetId: string;
  let childId: string;
  const state = (serviceId?: string) => readiness.execute({ companyId: a.companyId }, assetId, { includeProposed: true, serviceId });

  beforeAll(async () => {
    assetId = await cloudAsset(a, `aws-servicio-${RUN}`, { account_id: ACCOUNT, read_only_role: ROLE_ARN });
    await importScan.execute({ companyId: a.companyId }, importArgs(assetId, failing()));
    // El grupo de seguridad que falla es un ACTIVO del cliente (descubierto dentro de la conexión); lo demás (MFA, registro de actividad) es de toda la cuenta.
    childId = (
      await owner<{ id: string }>(
        `insert into tenant.assets (id, tenant_id, organization_id, code, connection_category, type, name, platform, criticality, tags, origin, status, operational_status, technical_coverage, parent_asset_id, resource_id)
         select gen_random_uuid(), p.tenant_id, p.organization_id, 'AST-9' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0'), 'ac_02', 'server', 'sg-api', 'Servidor', 'medium', '[]'::jsonb, 'discovered', 'active', 'not_monitored', '0/18', p.id, r.id
         from tenant.assets p join tenant.asset_resources r on r.asset_id = p.id where p.id = $1 and r.resource_uid = $2 returning id`,
        [assetId, SG],
      )
    )[0].id;
  });

  it('sin un servicio mide la cuenta entera', async () => {
    expect((await state())!.readiness).toBe('needs_work');
  });

  it('un servicio al que NO pertenece el activo que falla no lo ve fallar, pero sí lo que es de toda la cuenta', async () => {
    const scoped = (await state(a.serviceId))!;
    expect(scoped.readiness).not.toBe('needs_work');
    expect(scoped.needsManualReview).toBe(1); // lo de la cuenta entera sigue contando
  });

  it('al enlazar el activo al servicio, vuelve a contar su fallo', async () => {
    await owner('insert into tenant.service_assets (id, tenant_id, asset_id, service_id) values (gen_random_uuid(), $1, $2, $3)', [a.companyId, childId, a.serviceId]);
    expect((await state(a.serviceId))!.readiness).toBe('needs_work');
  });

  it('un servicio de otra empresa es 404', async () => {
    await expect(state(b.serviceId)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
