import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { ImportScanUseCase } from '../../src/features/technical-control/application/use-cases/scan.use-cases';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { awsBody, dosEmpresas, Tenant } from '../support/escenario';
import { asignarControl } from '../support/asignaciones';

// D90 · Qué falló y cómo corregirlo (contracts/modules/compliance-audit.md): para una prueba de nube de un control, lo que no cumplió la última evaluación y la guía para
// corregirlo. Sale por HTTP con la sesión real de cada rol, contra el Postgres desechable. Nada de lo que sale nombra al proveedor de la sonda.
type Agent = Awaited<ReturnType<typeof login>>;
const ACCOUNT = '123456789012';
const ROLE_ARN = `arn:aws:iam::${ACCOUNT}:role/MonkeyReadOnly`;
const CHECK_A = `d90_storage_public_${RUN}`;
const CHECK_B = `d90_logging_off_${RUN}`;
const CHECK_C = `d90_untranslated_${RUN}`;

let app: INestApplication;
let a: Tenant;
let b: Tenant;
let auditor: Agent;
let responsable: Agent;
let controlId: string;
let testId: string;
let path: string;

async function cuenta(companyId: string, email: string, role: 'auditor' | 'responsable'): Promise<void> {
  await owner(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role)
     values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role)`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
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

async function insertCheck(checkId: string, over: { titleEn: string; remediation: string; titleEs?: string; remediationEs?: string; origin?: string }): Promise<void> {
  await owner(
    `insert into catalog.checks (id, platform, policy_id, check_id, title_en, title_es, condition, remediation, remediation_es, translation_origin, origin, mapping_provenance, mapping_confidence)
     values (gen_random_uuid(), 'aws', 'cloud_configuration', $1, $2, $3, 'c', $4, $5, $6::catalog.check_translation_origin, 'engine_native', 'test', 'low')`,
    [checkId, over.titleEn, over.titleEs ?? null, over.remediation, over.remediationEs ?? null, over.remediationEs ? 'machine' : null],
  );
  await owner(
    `insert into catalog.test_checks (id, test_id, check_id, provenance)
     select gen_random_uuid(), $1, ch.id, 'committee_ratified' from catalog.checks ch where ch.platform = 'aws' and ch.policy_id = 'cloud_configuration' and ch.check_id = $2`,
    [testId, checkId],
  );
}

beforeAll(async () => {
  app = await bootApp();
  ({ a, b } = await dosEmpresas(app));
  await cuenta(a.companyId, `auditor-d90-${RUN}@cumplimiento.test`, 'auditor');
  await cuenta(a.companyId, `responsable-d90-${RUN}@cumplimiento.test`, 'responsable');
  auditor = await login(app, `auditor-d90-${RUN}@cumplimiento.test`);
  responsable = await login(app, `responsable-d90-${RUN}@cumplimiento.test`);

  const created = await a.agent.post('/v1/assets').send(awsBody(a, `aws-d90-${RUN}`));
  if (created.status !== 201) throw new Error(`activo: ${created.status} ${JSON.stringify(created.body)}`);
  const assetId = created.body.data.id as string;
  await a.agent.patch(`/v1/assets/${assetId}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
  await a.agent.post(`/v1/assets/${assetId}/validate`).expect(200);

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

  await insertCheck(CHECK_A, { titleEn: 'Storage allows public access', titleEs: 'El almacenamiento permite acceso público', remediation: 'Block public access on the bucket.', remediationEs: 'Bloquea el acceso público del almacenamiento.' });
  await insertCheck(CHECK_B, { titleEn: 'Logging is off', remediation: 'Turn on logging. See the Prowler documentation.' });
  await insertCheck(CHECK_C, { titleEn: 'Another failure', remediation: 'Fix the setting.' });

  await app.get(ImportScanUseCase).execute(
    { companyId: a.companyId },
    {
      assetId,
      origin: 'manual' as const,
      actorUserId: null,
      startedAt: new Date('2026-10-09T10:00:00Z'),
      finishedAt: new Date('2026-10-09T10:02:00Z'),
      engineVersion: '5.44.0',
      regions: ['us-east-1'],
      raw: [
        fail(CHECK_A, `arn:aws:s3:::bucket-uno-${RUN}`, 'Medium'),
        fail(CHECK_A, `arn:aws:s3:::bucket-dos-${RUN}`, 'High'),
        fail(CHECK_B, `arn:aws:cloudtrail:us-east-1:${ACCOUNT}:trail/principal`, 'Critical'),
        fail(CHECK_C, `arn:aws:iam::${ACCOUNT}:user/ana`, 'Low'),
      ],
    },
  );
});
afterAll(async () => {
  await app?.close();
});

describe('Qué falló y cómo corregirlo (D90)', () => {
  it('el administrador recibe los hallazgos agrupados por comprobación, de lo más grave a lo menos, con la forma del contrato', async () => {
    const res = await a.agent.get(`${path}?page_size=100`).expect(200);
    expect(res.body.message).toBeTruthy();
    const d = res.body.data;
    expect(d.test_id).toBe(testId);
    expect(d.measured_at).toBeTruthy();
    expect(d.total).toBe(3);
    expect(d.items.map((f: any) => f.severity)).toEqual(['critical', 'high', 'low']);
    const storage = d.items.find((f: any) => f.severity === 'high');
    expect(Object.keys(storage).sort()).toEqual(['id', 'remediation', 'resources', 'resources_total', 'severity', 'title']);
    expect(storage.resources_total).toBe(2);
    expect(storage.resources.map((r: any) => r.name).sort()).toEqual([`bucket-dos-${RUN}`, `bucket-uno-${RUN}`]);
    expect(Object.keys(storage.resources[0]).sort()).toEqual(['name', 'region', 'uid']);
  });

  it('en español da la traducción de Monkey y avisa que la hizo una IA; sin traducción da el original en inglés', async () => {
    const items = (await a.agent.get(`${path}?page_size=100`).expect(200)).body.data.items as any[];
    const translated = items.find((f) => f.severity === 'high');
    expect(translated.title).toBe('El almacenamiento permite acceso público');
    expect(translated.remediation).toEqual({ text: 'Bloquea el acceso público del almacenamiento.', language: 'es', is_ai_generated: true });
    const original = items.find((f) => f.severity === 'low');
    expect(original.remediation).toEqual({ text: 'Fix the setting.', language: 'en', is_ai_generated: false });
  });

  it('en inglés pide el original, sin marcarlo como traducción', async () => {
    const items = (await a.agent.get(`${path}?page_size=100`).set('Accept-Language', 'en').expect(200)).body.data.items as any[];
    const storage = items.find((f) => f.severity === 'high');
    expect(storage.title).toBe('Storage allows public access');
    expect(storage.remediation).toEqual({ text: 'Block public access on the bucket.', language: 'en', is_ai_generated: false });
  });

  it('nunca nombra al proveedor de la sonda ni trae el texto crudo del motor o sus identificadores', async () => {
    const res = await a.agent.get(`${path}?page_size=100`).expect(200);
    const text = JSON.stringify(res.body);
    expect(text).not.toMatch(/prowler|wazuh/i);
    expect(text).not.toContain('texto crudo del motor');
    expect(text).not.toContain(CHECK_A);
    const leaky = (res.body.data.items as any[]).find((f) => f.severity === 'critical');
    expect(leaky.remediation).toBeNull(); // su guía nombra al proveedor: no sale
  });

  it('pagina', async () => {
    const res = await a.agent.get(`${path}?page=2&page_size=2`).expect(200);
    expect(res.body.data).toMatchObject({ page: 2, page_size: 2, total: 3, total_pages: 2 });
    expect(res.body.data.items).toHaveLength(1);
  });

  it('el auditor también lo ve; un responsable que no es dueño ni ejecutor del control, no (403)', async () => {
    await auditor.get(path).expect(200);
    await responsable.get(path).expect(403);
  });

  it('el dueño o el ejecutor del control sí lo ven (D102); si pierde la asignación, ya no', async () => {
    const [{ id }] = await owner<{ id: string }>('select id from platform.users where email = $1', [`responsable-d90-${RUN}@cumplimiento.test`]);
    await asignarControl(a.companyId, controlId, id);
    try {
      expect((await responsable.get(path).expect(200)).body.data.total).toBe(3);
    } finally {
      await owner('delete from platform.client_control_assignments where client_control_id = $1', [controlId]);
    }
    await responsable.get(path).expect(403);
  });

  it('para otra empresa el control no existe (404), igual que un control o una prueba inventados', async () => {
    await b.agent.get(path).expect(404);
    await a.agent.get(`/v1/controls/${controlId}/tests/00000000-0000-4000-8000-000000000000/findings`).expect(404);
    await a.agent.get(`/v1/controls/no-es-uuid/tests/${testId}/findings`).expect(404);
  });

  it('una prueba que no es de nube no tiene hallazgos que explicar (404)', async () => {
    const other = await owner<{ test_id: string }>(
      `select cct.test_id from tenant.client_control_tests cct join catalog.tests t on t.id = cct.test_id
        where cct.client_control_id = $1 and t.dimension <> 'cloud' limit 1`,
      [controlId],
    );
    if (other.length) await a.agent.get(`/v1/controls/${controlId}/tests/${other[0].test_id}/findings`).expect(404);
  });
});
