import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { ImportScanUseCase } from '../../src/features/technical-control/application/use-cases/scan.use-cases';
import { ScanRepository } from '../../src/features/technical-control/domain/repositories/scan.repository';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { awsBody, dosEmpresas, Tenant } from '../support/escenario';
import { asignarControl } from '../support/asignaciones';

// D90, D138 punto 3, D162, MD-502 (contracts/cumplimiento/brechas.md) · Las brechas de una prueba automática de un control: una fila por check y activo (brecha abierta, exceptuada u observación), con la
// MISMA lectura que el motor v2. Sale por HTTP con la sesión real de cada rol, contra el Postgres desechable. Nada de lo que sale nombra al proveedor de la sonda ni del motor.
type Agent = Awaited<ReturnType<typeof login>>;
const ACCOUNT = '123456789012';
const ROLE_ARN = `arn:aws:iam::${ACCOUNT}:role/MonkeyReadOnly`;
const CHECK_A = `d90_storage_public_${RUN}`;
const CHECK_B = `d90_logging_off_${RUN}`;
const CHECK_C = `d90_untranslated_${RUN}`;
const CHECK_D = `d90_complementary_${RUN}`;
const CHECK_E = `d90_sonda_${RUN}`;

let app: INestApplication;
let a: Tenant;
let b: Tenant;
let auditor: Agent;
let responsable: Agent;
let delegado: Agent;
let delegadoSin: Agent;
let controlId: string;
let testId: string;
let path: string;

async function cuenta(companyId: string, email: string, role: 'auditor' | 'responsable' | 'delegado'): Promise<void> {
  await owner(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role, is_internal)
     values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role, $5)`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role, role === 'delegado' ? true : null],
  );
}

const fail = (checkId: string, uid: string, severity: string, region = 'us-east-1') => ({
  status_code: 'FAIL',
  severity,
  status_detail: 'texto crudo del motor que el cliente no debe ver',
  metadata: { event_code: checkId },
  cloud: { region },
  resources: [{ uid, type: 'AwsS3Bucket', name: uid.split(':').pop() }],
});
const pass = (checkId: string, uid: string) => ({ ...fail(checkId, uid, 'Medium'), status_code: 'PASS' });

async function insertCheck(
  checkId: string,
  over: { titleEn: string; remediation: string; titleEs?: string; remediationEs?: string; condition?: string; role?: 'direct' | 'complementary'; testId?: string; platform?: string; policy?: string },
): Promise<string> {
  const [{ id }] = await owner<{ id: string }>(
    `insert into catalog.checks (id, platform, policy_id, check_id, title_en, title_es, condition, remediation, remediation_es, translation_origin, origin, mapping_provenance, mapping_confidence)
     values (gen_random_uuid(), $6, $7, $1, $2, $3, $8, $4, $5, $9::catalog.check_translation_origin, 'engine_native', 'test', 'low') returning id`,
    [checkId, over.titleEn, over.titleEs ?? null, over.remediation, over.remediationEs ?? null, over.platform ?? 'aws', over.policy ?? 'cloud_configuration', over.condition ?? 'The setting is evaluated.', over.remediationEs ? 'machine' : null],
  );
  await owner(`insert into catalog.test_checks (id, test_id, check_id, role, provenance) values (gen_random_uuid(), $1, $2, $3::catalog.check_role, 'committee_ratified')`, [over.testId ?? testId, id, over.role ?? 'direct']);
  return id;
}

const iso = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000);
let assetId: string;
let userId: (kind: 'responsable' | 'delegado' | 'delegado2') => Promise<string>;
let scanAt: Date[];

async function scan(at: Date, raw: object[]): Promise<void> {
  await app.get(ImportScanUseCase).execute(
    { companyId: a.companyId },
    { assetId, origin: 'manual' as const, actorUserId: null, startedAt: new Date(at.getTime() - 60_000), finishedAt: at, engineVersion: '5.44.0', regions: ['us-east-1'], raw },
  );
}

const email = (k: string) => `${k}-d90-${RUN}@cumplimiento.test`;

beforeAll(async () => {
  // Una corrida anterior que murió sin su `afterAll` deja sus vínculos en el catálogo: se retiran antes de sembrar.
  await owner(`delete from catalog.test_checks where check_id in (select id from catalog.checks where policy_id in ('cloud_configuration', 'e2e_sca_${RUN}') and check_id like 'd90\\_%')`);
  app = await bootApp();
  ({ a, b } = await dosEmpresas(app));
  await cuenta(a.companyId, email('auditor'), 'auditor');
  await cuenta(a.companyId, email('responsable'), 'responsable');
  auditor = await login(app, email('auditor'));
  await cuenta(a.companyId, email('delegado'), 'delegado');
  await cuenta(a.companyId, email('delegado2'), 'delegado');
  responsable = await login(app, email('responsable'));
  delegado = await login(app, email('delegado'));
  delegadoSin = await login(app, email('delegado2'));
  userId = async (kind) => (await owner<{ id: string }>('select id from platform.users where email = $1', [email(kind)]))[0].id;

  const created = await a.agent.post('/v1/assets').send(awsBody(a, `aws-d90-${RUN}`));
  if (created.status !== 201) throw new Error(`activo: ${created.status} ${JSON.stringify(created.body)}`);
  assetId = created.body.data.id as string;
  await a.agent.patch(`/v1/assets/${assetId}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
  await a.agent.post(`/v1/assets/${assetId}/validate`).expect(200);
  // La criticidad del activo entra en la prioridad (D162): baja, para que se vea el efecto de promediar.
  await owner(`update tenant.assets set criticality = 'low' where id = $1`, [assetId]);

  const target = await owner<{ id: string; test_id: string }>(
    `select c.id, t.id as test_id
       from tenant.client_controls c
       join tenant.client_control_tests cct on cct.client_control_id = c.id
       join catalog.tests t on t.id = cct.test_id and t.dimension = 'cloud'
      where c.service_id = $1 and c.is_active order by c.own_code limit 1`,
    [a.serviceId],
  );
  controlId = target[0].id;
  testId = target[0].test_id;
  path = `/v1/controls/${controlId}/tests/${testId}/findings`;

  await insertCheck(CHECK_A, { titleEn: 'Storage allows public access', titleEs: 'El almacenamiento permite acceso público', remediation: 'Block public access on the bucket.', remediationEs: 'Bloquea el acceso público del almacenamiento.', condition: 'Buckets are evaluated for public access.' });
  await insertCheck(CHECK_B, { titleEn: 'Logging is off', remediation: 'Turn on logging. See the Prowler documentation.', condition: 'Prowler evaluates the trail.' });
  await insertCheck(CHECK_C, { titleEn: 'Another failure', remediation: 'Fix the setting.' });
  await insertCheck(CHECK_D, { titleEn: 'Keys are rotated', remediation: 'Rotate the keys.', role: 'complementary' });

  // Tres corridas: A falla en la 1.ª, pasa en la 2.ª y vuelve a fallar en la 3.ª (su racha empieza en la 3.ª); B y C fallan en las tres (racha desde la 1.ª); D (Complementario) falla solo en la 3.ª.
  scanAt = [iso(30), iso(20), iso(10)];
  const bucketUno = `arn:aws:s3:::bucket-uno-${RUN}`;
  const bucketDos = `arn:aws:s3:::bucket-dos-${RUN}`;
  const trail = `arn:aws:cloudtrail:us-east-1:${ACCOUNT}:trail/principal`;
  const ana = `arn:aws:iam::${ACCOUNT}:user/ana`;
  await scan(scanAt[0], [fail(CHECK_A, bucketUno, 'Medium'), fail(CHECK_B, trail, 'Critical'), fail(CHECK_C, ana, 'Low'), pass(CHECK_D, ana)]);
  await scan(scanAt[1], [pass(CHECK_A, bucketUno), fail(CHECK_B, trail, 'Critical'), fail(CHECK_C, ana, 'Low'), pass(CHECK_D, ana)]);
  await scan(scanAt[2], [fail(CHECK_A, bucketUno, 'Medium'), fail(CHECK_A, bucketDos, 'High'), fail(CHECK_B, trail, 'Critical'), fail(CHECK_C, ana, 'Low'), fail(CHECK_D, `arn:aws:iam::${ACCOUNT}:user/ci-deploy`, 'Medium')]);
});
afterAll(async () => {
  await app?.close();
  // El vínculo que se sembró cambia qué mide la prueba en las demás suites del worker (el catálogo es global): se retira; los checks quedan porque los resultados importados los referencian.
  await owner(`delete from catalog.test_checks where check_id in (select id from catalog.checks where check_id like 'd90\\_%${RUN}')`);
});

type Item = Record<string, any>;
const list = async (agent: Agent = a.agent, query = '?page_size=100', lang?: string) => {
  const req = agent.get(`${path}${query}`);
  return (await (lang ? req.set('Accept-Language', lang) : req).expect(200)).body.data;
};
const byTitle = (items: Item[], title: string): Item => items.find((i) => i.title === title) as Item;

describe('Las brechas de una prueba (MD-502)', () => {
  it('trae el control, la prueba, la medición, el resumen y una fila por check y activo con la forma del contrato', async () => {
    const res = await a.agent.get(`${path}?page_size=100`).expect(200);
    expect(res.body.message).toBeTruthy();
    const d = res.body.data;
    expect(d.control).toMatchObject({ id: controlId, code: expect.any(String), name: expect.any(String) });
    expect(d.test).toMatchObject({ id: testId, code: expect.any(String) });
    expect(d.measured_at).toBe(scanAt[2].toISOString());
    expect(d.summary).toEqual({ open_gaps: 3, excepted: 0, observations: 1 });
    expect(d.total).toBe(4);
    const gap = byTitle(d.items, 'El almacenamiento permite acceso público');
    expect(Object.keys(gap).sort()).toEqual(['asset', 'due_date', 'evaluated', 'exception', 'failing_since', 'id', 'kind', 'owner', 'priority', 'priority_basis', 'remediation', 'resources', 'resources_total', 'title']);
    expect(gap).toMatchObject({ kind: 'gap', asset: { id: assetId, name: `aws-d90-${RUN}`, criticality: 'low' }, exception: null, resources_total: 2 });
    expect(gap.id.startsWith(`${assetId}:`)).toBe(true);
    expect(gap.resources.map((r: Item) => r.name).sort()).toEqual([`bucket-dos-${RUN}`, `bucket-uno-${RUN}`]);
    expect(Object.keys(gap.resources[0]).sort()).toEqual(['name', 'region', 'uid']);
    expect(d.items.every((i: Item) => !('severity' in i))).toBe(true);
  });

  it('la prioridad sale de la severidad del check y la criticidad del activo (D162), con su base', async () => {
    const items = (await list()).items as Item[];
    // Crítico en un activo de criticidad baja: (4 + 1) / 2 = 2,5 → 3 = alta. Alta + baja: 2 = media. Baja + baja = baja.
    expect(byTitle(items, 'Logging is off')).toMatchObject({ kind: 'gap', priority: 'high', priority_basis: { severity: 'critical', asset_criticality: 'low' } });
    expect(byTitle(items, 'El almacenamiento permite acceso público')).toMatchObject({ priority: 'medium', priority_basis: { severity: 'high', asset_criticality: 'low' } });
    expect(byTitle(items, 'Another failure')).toMatchObject({ priority: 'low', priority_basis: { severity: 'low', asset_criticality: 'low' } });
  });

  it('una observación (check Complementario) no lleva prioridad, base, responsable, fecha ni excepción', async () => {
    const obs = byTitle((await list()).items, 'Keys are rotated');
    expect(obs).toMatchObject({ kind: 'observation', priority: null, priority_basis: null, owner: null, due_date: null, exception: null, resources_total: 1 });
  });

  it('ordena: las brechas por prioridad (de crítica a baja), luego las observaciones', async () => {
    const items = (await list()).items as Item[];
    expect(items.map((i) => `${i.kind}:${i.priority}`)).toEqual(['gap:high', 'gap:medium', 'gap:low', 'observation:null']);
  });

  it('failing_since es la primera corrida de la racha actual de ese check en ese activo', async () => {
    const items = (await list()).items as Item[];
    expect(byTitle(items, 'Logging is off').failing_since).toBe(scanAt[0].toISOString());
    expect(byTitle(items, 'Another failure').failing_since).toBe(scanAt[0].toISOString());
    // A falló, pasó y volvió a fallar: la racha actual empieza en la 3.ª corrida.
    expect(byTitle(items, 'El almacenamiento permite acceso público').failing_since).toBe(scanAt[2].toISOString());
    expect(byTitle(items, 'Keys are rotated').failing_since).toBe(scanAt[2].toISOString());
  });

  it('en español da la traducción y avisa que la hizo una IA; sin traducción da el original en inglés. Lo que evalúa el catálogo sale en inglés', async () => {
    const items = (await list()).items as Item[];
    const translated = byTitle(items, 'El almacenamiento permite acceso público');
    expect(translated.remediation).toEqual({ text: 'Bloquea el acceso público del almacenamiento.', language: 'es', is_ai_generated: true });
    expect(translated.evaluated).toEqual({ text: 'Buckets are evaluated for public access.', language: 'en', is_ai_generated: false });
    expect(byTitle(items, 'Another failure').remediation).toEqual({ text: 'Fix the setting.', language: 'en', is_ai_generated: false });
  });

  it('en inglés pide el original, sin marcarlo como traducción', async () => {
    const items = (await list(a.agent, '?page_size=100', 'en')).items as Item[];
    const storage = byTitle(items, 'Storage allows public access');
    expect(storage.remediation).toEqual({ text: 'Block public access on the bucket.', language: 'en', is_ai_generated: false });
  });

  it('nunca nombra al proveedor ni trae el texto crudo del motor o sus identificadores; lo que lo nombra se omite', async () => {
    const res = await a.agent.get(`${path}?page_size=100`).expect(200);
    const text = JSON.stringify(res.body);
    expect(text).not.toMatch(/prowler|wazuh/i);
    expect(text).not.toContain('texto crudo del motor');
    expect(text).not.toContain(CHECK_A);
    expect(text).not.toContain('AwsS3Bucket');
    const leaky = byTitle(res.body.data.items, 'Logging is off');
    expect(leaky.remediation).toBeNull(); // su guía nombra al proveedor: no sale
    expect(leaky.evaluated).toBeNull(); // su descripción tampoco
  });

  it('pagina sobre los ítems: el resumen no se parte', async () => {
    const res = await a.agent.get(`${path}?page=2&page_size=3`).expect(200);
    expect(res.body.data).toMatchObject({ page: 2, page_size: 3, total: 4, total_pages: 2, summary: { open_gaps: 3, excepted: 0, observations: 1 } });
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].kind).toBe('observation');
  });

  it('el auditor también lo ve; un responsable que no es dueño ni ejecutor del control, no (403)', async () => {
    await auditor.get(path).expect(200);
    await responsable.get(path).expect(403);
    await delegado.get(path).expect(403);
  });

  it('el dueño o el ejecutor del control sí lo ven (D102); si pierde la asignación, ya no', async () => {
    await asignarControl(a.companyId, controlId, await userId('responsable'));
    try {
      expect((await responsable.get(path).expect(200)).body.data.total).toBe(4);
    } finally {
      await owner('delete from platform.client_control_assignments where client_control_id = $1', [controlId]);
    }
    await responsable.get(path).expect(403);
  });

  it('el delegado ejecutor lo ve; otro delegado sin el control y el de otro dueño, no (403); si lo quitan como ejecutor, ya no', async () => {
    await asignarControl(a.companyId, controlId, await userId('responsable'), await userId('delegado'));
    try {
      expect((await delegado.get(path).expect(200)).body.data.total).toBe(4);
      expect((await responsable.get(path).expect(200)).body.data.total).toBe(4);
      await delegadoSin.get(path).expect(403);
      await delegado.get(`${path}?page=1`).expect(200);
    } finally {
      await owner('delete from platform.client_control_assignments where client_control_id = $1', [controlId]);
    }
    await delegado.get(path).expect(403);
    await delegadoSin.get(path).expect(403);
  });

  it('para otra empresa el control no existe (404), igual que un control o una prueba inventados', async () => {
    await b.agent.get(path).expect(404);
    await a.agent.get(`/v1/controls/${controlId}/tests/00000000-0000-4000-8000-000000000000/findings`).expect(404);
    await a.agent.get(`/v1/controls/no-es-uuid/tests/${testId}/findings`).expect(404);
    const [ajeno] = await owner<{ id: string }>('select id from tenant.client_controls where service_id = $1 limit 1', [b.serviceId]);
    for (const agent of [responsable, delegado, delegadoSin]) await agent.get(`/v1/controls/${ajeno.id}/tests/${testId}/findings`).expect(404);
  });

  it('una prueba documental (política) no tiene brechas que explicar (404)', async () => {
    const other = await owner<{ test_id: string }>(
      `select cct.test_id from tenant.client_control_tests cct join catalog.tests t on t.id = cct.test_id
        where cct.client_control_id = $1 and t.dimension = 'policy' limit 1`,
      [controlId],
    );
    if (other.length) await a.agent.get(`/v1/controls/${controlId}/tests/${other[0].test_id}/findings`).expect(404);
  });
});

describe('Responsable y fecha compromiso (MD-502)', () => {
  const PLAN = `insert into tenant.remediation_plans (id, tenant_id, client_control_id, test_id, what, assignee_id, due_date, status, proposed_by, window_start, decided_by, decided_at)
                values (gen_random_uuid(), $1, $2, $3, 'Plan de prueba', $4, '2030-12-15', $5::tenant.change_request_status, $4, null, case when $5 = 'pending' then null else $4::uuid end, case when $5 = 'pending' then null else now() end)`;
  const limpiarPlanes = () => owner('delete from tenant.remediation_plans where client_control_id = $1', [controlId]);
  afterEach(async () => {
    await limpiarPlanes();
    await owner('delete from platform.client_control_assignments where client_control_id = $1', [controlId]);
  });

  it('sin plan: el responsable del control y sin fecha; sin responsable asignado, nulo', async () => {
    const sin = (await list()).items.filter((i: Item) => i.kind === 'gap') as Item[];
    expect(sin.every((i) => i.owner === null && i.due_date === null)).toBe(true);
    const id = await userId('responsable');
    await asignarControl(a.companyId, controlId, id);
    const con = (await list()).items.filter((i: Item) => i.kind === 'gap') as Item[];
    expect(con.every((i) => i.owner?.id === id && i.owner.name === 'Prueba' && i.owner.last_name === 'Roles' && i.due_date === null)).toBe(true);
  });

  it('con un plan aprobado y vigente de la prueba: su responsable y su fecha', async () => {
    const dueno = await userId('responsable');
    const asignado = await userId('delegado');
    await asignarControl(a.companyId, controlId, dueno);
    await owner(PLAN, [a.companyId, controlId, testId, asignado, 'approved']);
    const gaps = (await list()).items.filter((i: Item) => i.kind === 'gap') as Item[];
    expect(gaps.every((i) => i.owner?.id === asignado && i.due_date === '2030-12-15')).toBe(true);
    // Una observación no lleva responsable ni fecha, haya plan o no.
    expect(byTitle((await list()).items, 'Keys are rotated')).toMatchObject({ owner: null, due_date: null });
  });

  it('un plan pendiente no cuenta: sigue el responsable del control y sin fecha', async () => {
    const dueno = await userId('responsable');
    await asignarControl(a.companyId, controlId, dueno);
    await owner(PLAN, [a.companyId, controlId, testId, await userId('delegado'), 'pending']);
    const gap = (await list()).items.find((i: Item) => i.kind === 'gap') as Item;
    expect(gap).toMatchObject({ owner: { id: dueno }, due_date: null });
  });
});

describe('Una excepción vigente (MD-502, D135)', () => {
  const EXCEPCION = (dias: [string, string]) =>
    owner(
      `insert into tenant.exclusions (id, tenant_id, service_id, test_id, asset_id, proposed_by, decided_by, status, requested_at, decided_at, justification, valid_from, valid_until)
       select gen_random_uuid(), $1, $2, $3, $4, u.id, u.id, 'approved', now(), now(), 'excepción de prueba', ${dias[0]}, ${dias[1]} from platform.users u where u.company_id = $1 and u.role = 'admin_empresa' limit 1`,
      [a.companyId, a.serviceId, testId, assetId],
    );
  afterEach(() => owner('delete from tenant.exclusions where tenant_id = $1', [a.companyId]));

  it('el FAIL Directo de esa prueba en ese activo sale `excepted`, con su excepción, y ya no cuenta como brecha abierta', async () => {
    await EXCEPCION(['current_date - 1', 'current_date + 30']);
    const d = await list();
    expect(d.summary).toEqual({ open_gaps: 0, excepted: 3, observations: 1 });
    const items = d.items as Item[];
    expect(items.map((i) => i.kind)).toEqual(['excepted', 'excepted', 'excepted', 'observation']);
    const [ex] = await owner<{ id: string; until: string }>(`select id, to_char(valid_until, 'YYYY-MM-DD') until from tenant.exclusions where tenant_id = $1`, [a.companyId]);
    expect(items[0].exception).toEqual({ id: ex.id, effective_until: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) });
    expect(items[0].priority).toBeTruthy();
    expect(items[0].priority_basis).toBeTruthy();
    // La excepción dura como máximo PR-04 días desde su inicio: nunca pasa de la fecha pedida.
    expect(items[0].exception.effective_until <= ex.until).toBe(true);
  });

  it('una excepción vencida no cambia nada: vuelve a ser brecha abierta', async () => {
    await EXCEPCION(['current_date - 60', 'current_date - 1']);
    expect((await list()).summary).toEqual({ open_gaps: 3, excepted: 0, observations: 1 });
  });
});

describe('La sonda no califica sus checks (MD-502, D141 punto 3)', () => {
  const POLICY = `e2e_sca_${RUN}`;
  let probeTest: string;
  let probeControl: string;
  let probeCheck: string;

  beforeAll(async () => {
    const [found] = await owner<{ control: string; test: string }>(
      `select cct.client_control_id control, cct.test_id test
         from tenant.client_control_tests cct
         join tenant.client_controls cc on cc.id = cct.client_control_id and cc.service_id = $1 and cc.is_active
         join catalog.tests t on t.id = cct.test_id and t.dimension = 'server' and t.type = 'technical'
        order by cc.id, t.code limit 1`,
      [a.serviceId],
    );
    if (!found) throw new Error('ningún control del servicio lleva una prueba técnica de servidores');
    probeControl = found.control;
    probeTest = found.test;
    probeCheck = await insertCheck(CHECK_E, { titleEn: 'Password policy is enforced', remediation: 'Enforce a password policy.', platform: 'linux', policy: POLICY, testId: probeTest });
    await owner(`update tenant.assets set criticality = 'high' where id = $1`, [assetId]);
    const fin = iso(5);
    const [{ id }] = await owner<{ id: string }>(
      `insert into tenant.executions (id, tenant_id, asset_id, status, origin, kind, started_at) values (gen_random_uuid(), $1, $2, 'running', 'manual', 'assessment', $3) returning id`,
      [a.companyId, assetId, new Date(fin.getTime() - 60_000)],
    );
    const row = { checkId: probeCheck, platform: 'linux', policyId: POLICY, rawCheckId: CHECK_E, result: 'failed' as const, evaluatedAt: fin, statusDetail: null };
    await app.get(ScanRepository).completeSca(
      { companyId: a.companyId },
      id,
      { agentId: 'agente-de-prueba', finishedAt: fin, sondaVersion: '4.9.0', checksExecuted: 1, rows: [row], logs: [] },
      (r) => ({ tenantId: a.companyId, userId: null, action: 'execution.complete', resource: 'execution', result: 'success', ipAddress: '', userAgent: 'jest', afterState: { execution_id: r.executionId, source: 'sca' } }),
    );
  });
  afterAll(async () => {
    await owner(`update tenant.assets set criticality = 'low' where id = $1`, [assetId]);
    await owner(`delete from catalog.test_checks where check_id = $1`, [probeCheck]);
  });

  it('sin severidad la prioridad es la criticidad del activo, y la base lo dice (severity null); el servidor no trae recursos', async () => {
    const res = await a.agent.get(`/v1/controls/${probeControl}/tests/${probeTest}/findings`).expect(200);
    const item = (res.body.data.items as Item[]).find((i) => i.title === 'Password policy is enforced') as Item;
    expect(item).toMatchObject({ kind: 'gap', asset: { id: assetId, criticality: 'high' }, priority: 'high', priority_basis: { severity: null, asset_criticality: 'high' }, resources_total: 0, resources: [] });
    expect(JSON.stringify(res.body)).not.toMatch(/prowler|wazuh/i);
  });
});
