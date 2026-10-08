import type { INestApplication } from '@nestjs/common';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { GetAssetReadinessUseCase, RecordScanUseCase } from '../../src/features/technical-control/application/use-cases/scan.use-cases';
import { EngineFinding } from '../../src/features/technical-control/domain/scan/scan.types';
import { bootApp, owner, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// D56: una corrida de la sonda de nube se guarda entera o no se guarda (con su rastro, SEG-36), vive bajo RLS y de ella se deriva
// el estado de preparación. Los checks usados existen en el catálogo real; aquí solo se aseguran por si la base no trae el seed de nube.
const CHECKS = [
  { id: 'iam_root_mfa_enabled', test: 'T-CLD-001' },
  { id: 'ec2_securitygroup_allow_ingress_from_internet_to_tcp_port_22', test: 'T-CLD-002' },
  { id: 'cloudtrail_multi_region_enabled', test: 'T-CLD-003' },
];

let app: INestApplication;
let a: Tenant;
let b: Tenant;
let cloudAssetId: string;
let record: RecordScanUseCase;
let readiness: GetAssetReadinessUseCase;
const realInsert = auditInsert.insertAuditLog;

const finding = (checkId: string, over: Partial<EngineFinding> = {}): EngineFinding => ({
  checkId,
  status: 'passed',
  region: 'us-east-1',
  severity: 'medium',
  detail: null,
  resource: { uid: `arn:aws:test:us-east-1:123456789012:${checkId}`, type: 'Other', name: checkId },
  ...over,
});
const findings = [
  finding(CHECKS[0].id),
  finding(CHECKS[1].id, { status: 'failed', severity: 'high', resource: { uid: 'arn:aws:ec2:us-east-1:123456789012:security-group/sg-1', type: 'AwsEc2SecurityGroup', name: 'sg-1' } }),
  finding(CHECKS[2].id, { status: 'manual' }),
];
const base = () => ({ origin: 'manual' as const, actorUserId: null, startedAt: new Date('2026-10-09T10:00:00Z'), finishedAt: new Date('2026-10-09T10:02:00Z'), engineVersion: '5.44.0', regions: ['us-east-1'], findings });

const count = (sql: string, params: unknown[]) => owner<{ n: number }>(sql, params).then((r) => r[0].n);

beforeAll(async () => {
  app = await bootApp();
  ({ a, b } = await dosEmpresas(app));
  record = app.get(RecordScanUseCase);
  readiness = app.get(GetAssetReadinessUseCase);
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
  const res = await a.agent.post('/v1/assets').send({
    name: `aws-${RUN}`,
    connection_category: 'ac_01',
    platform: 'AWS',
    service_ids: [a.serviceId],
    credentials: { account_id: '123456789012', read_only_role: 'arn:aws:iam::123456789012:role/MonkeyReadOnly' },
  });
  if (res.status !== 201) throw new Error(`activo de nube: ${res.status} ${JSON.stringify(res.body)}`);
  cloudAssetId = res.body.data.id;
});
afterAll(async () => {
  await app?.close();
});
afterEach(() => jest.restoreAllMocks());

describe('Una corrida de la sonda de nube se guarda y se lee bajo RLS', () => {
  let executionId: string;

  it('guarda ejecución, recursos y resultados, y NO guarda los checks sin filas', async () => {
    const out = await record.execute({ companyId: a.companyId }, { assetId: cloudAssetId, ...base() });
    executionId = out.executionId;
    expect(out).toMatchObject({ resultCount: 3, resourceCount: 3 });
    expect(await count('select count(*)::int n from tenant.check_results where execution_id = $1', [executionId])).toBe(3);
    expect(await count(`select count(*)::int n from tenant.check_results where execution_id = $1 and result = 'not_applicable'`, [executionId])).toBe(0);
    expect(await count('select count(*)::int n from tenant.asset_resources where asset_id = $1', [cloudAssetId])).toBe(3);
    const [ex] = await owner<{ status: string; engine_version: string; checks_executed: number; regions: string[] }>(
      'select status, engine_version, checks_executed, regions from tenant.executions where id = $1',
      [executionId],
    );
    expect(ex).toMatchObject({ status: 'completed', engine_version: '5.44.0', regions: ['us-east-1'] });
    expect(ex.checks_executed).toBeGreaterThanOrEqual(3);
  });

  it('deja exactamente un rastro de la corrida, con su empresa, sin el texto crudo del motor', async () => {
    const rows = await owner<{ after_state: Record<string, unknown> }>(`select after_state from audit.audit_logs where tenant_id = $1 and action = 'execution.complete'`, [a.companyId]);
    expect(rows).toHaveLength(1);
    expect(rows[0].after_state).toMatchObject({ execution_id: executionId, asset_id: cloudAssetId, results: 3 });
  });

  it('MANUAL queda not_run y la falla alta lleva a «Requiere trabajo» (R-05, R-06)', async () => {
    const out = await readiness.execute({ companyId: a.companyId }, cloudAssetId, { includeProposed: true });
    expect(out).not.toBeNull();
    expect(out!.readiness).toBe('needs_work');
    expect(out!.needsManualReview).toBe(1);
    expect(out!.ofMeasured).toEqual({ compliant: 1, notCompliant: 1 });
  });

  it('en modo producción, sin mapeos ratificados, no cuenta nada: «Sin medir», no un fallo', async () => {
    const out = await readiness.execute({ companyId: a.companyId }, cloudAssetId, { includeProposed: false });
    expect(out!.readiness).toBe('not_measured');
  });

  it('otra empresa no ve la corrida ni puede escribir sobre el activo (RLS)', async () => {
    expect(await readiness.execute({ companyId: b.companyId }, cloudAssetId, { includeProposed: true })).toBeNull();
    await expect(record.execute({ companyId: b.companyId }, { assetId: cloudAssetId, ...base() })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(await count('select count(*)::int n from tenant.executions where asset_id = $1', [cloudAssetId])).toBe(1);
  });

  it('una segunda corrida reutiliza los recursos (no los duplica) y la lectura usa la última', async () => {
    await record.execute({ companyId: a.companyId }, { assetId: cloudAssetId, ...base(), finishedAt: new Date('2026-10-09T11:00:00Z'), findings: [finding(CHECKS[0].id), finding(CHECKS[1].id), finding(CHECKS[2].id)] });
    expect(await count('select count(*)::int n from tenant.asset_resources where asset_id = $1', [cloudAssetId])).toBeGreaterThanOrEqual(3);
    const out = await readiness.execute({ companyId: a.companyId }, cloudAssetId, { includeProposed: true });
    expect(out!.readiness).toBe('ready');
  });
});

describe('Atomicidad: la corrida entera o nada', () => {
  it('si el rastro falla DESPUÉS de insertarse, no queda ni la ejecución, ni los resultados, ni los recursos', async () => {
    const before = await count('select count(*)::int n from tenant.executions where asset_id = $1', [cloudAssetId]);
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, e) => {
      await realInsert(db, e);
      throw new Error('audit_down');
    });
    const uid = `arn:aws:test:us-east-1:123456789012:rollback-${RUN}`;
    await expect(
      record.execute({ companyId: a.companyId }, { assetId: cloudAssetId, ...base(), findings: [finding(CHECKS[0].id, { resource: { uid, type: 'Other', name: 'x' } })] }),
    ).rejects.toThrow('audit_down');
    expect(await count('select count(*)::int n from tenant.executions where asset_id = $1', [cloudAssetId])).toBe(before);
    expect(await count('select count(*)::int n from tenant.asset_resources where resource_uid = $1', [uid])).toBe(0);
  });
});

describe('Evaluaciones regionales', () => {
  it('la misma configuración en dos regiones es UNA evaluación sin región (D53) y manda la peor', async () => {
    const uid = (r: string) => `arn:aws:test:${r}:123456789012:logging-${RUN}`;
    const out = await record.execute(
      { companyId: a.companyId },
      {
        assetId: cloudAssetId,
        ...base(),
        regions: ['us-east-1', 'us-east-2'],
        findings: [
          finding(CHECKS[2].id, { region: 'us-east-1', resource: { uid: uid('us-east-1'), type: 'Other', name: 'l' } }),
          finding(CHECKS[2].id, { region: 'us-east-2', status: 'failed', severity: 'high', resource: { uid: uid('us-east-2'), type: 'Other', name: 'l' } }),
        ],
      },
    );
    const rows = await owner<{ result: string; region: string | null }>('select result, region from tenant.check_results where execution_id = $1', [out.executionId]);
    expect(rows).toEqual([{ result: 'failed', region: null }]);
  });
});
