import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { FileStorage } from '../../src/common/storage/file-storage';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// D91 · Todo cambio de estado de un control deja un evento inmutable con el estado anterior y el nuevo (REQ-044). Aquí, el de la evidencia: una entrega nueva devuelve la prueba a
// revisión y la revisión del admin_empresa la mueve (D96); el auditor no revisa. Los eventos del veredicto, de la sonda y de la exclusión se prueban junto a su escritura.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let auditor: Agent;
let adminId: string;
let controlId: string;
let testId: string;
const storage = new StorageEnMemoria();

const pdf = (marca: string) => Buffer.from(`%PDF-1.7\n% evidencia ${marca} ${RUN}\n`);
const ALL_OK = { type_ok: true, period_ok: true, valid_ok: true, approved_ok: true, signed_ok: true, content_ok: true, review: 'human_validated' as const };
const submit = (marca: string) => a.agent.post(`/v1/controls/${controlId}/tests/${testId}/evidence`).attach('file', pdf(marca), `${marca}.pdf`);
const review = (agent: Agent, submissionId: string) => agent.put(`/v1/evidence-submissions/${submissionId}/review`).send(ALL_OK);
const detail = async () => {
  const d = (await a.agent.get(`/v1/controls/${controlId}?view=technical`).expect(200)).body.data;
  return { state: d.technical.control_state as string, readiness: d.readiness as string };
};
const events = (cause: string) =>
  owner<{ previous_value: any; new_value: any; user_id: string | null }>(
    `select previous_value, new_value, user_id from audit.compliance_events
      where tenant_id = $1 and changed_field = 'control.state' and new_value->>'control_id' = $2 and new_value->>'cause' = $3 order by created_at`,
    [a.companyId, controlId, cause],
  );

async function cuenta(companyId: string, email: string, role: 'auditor'): Promise<string> {
  return (await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  ))[0].id;
}

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  ({ a } = await dosEmpresas(app));
  adminId = (await owner<{ id: string }>(`select id from platform.users where email = $1`, [a.email]))[0].id;
  await cuenta(a.companyId, `auditor-evt-${RUN}@cumplimiento.test`, 'auditor');
  auditor = await login(app, `auditor-evt-${RUN}@cumplimiento.test`);

  // Un control cuya única prueba documental es la que se va a entregar: así validarla mueve al control entero.
  const [c] = await owner<{ control: string; test: string }>(
    `select cc.id control, (array_agg(x.test_id))[1] test from tenant.client_controls cc
       join tenant.client_control_tests x on x.client_control_id = cc.id
       join catalog.tests t on t.id = x.test_id
      where cc.service_id = $1 and cc.is_active
      group by cc.id, cc.own_code having count(*) = 1 and bool_and(t.dimension = 'policy') order by cc.own_code limit 1`,
    [a.serviceId],
  );
  expect(c).toBeDefined();
  controlId = c.control;
  testId = c.test;
});
afterAll(async () => {
  await app?.close();
});

describe('La evidencia mueve el estado de un control y queda el evento (D91)', () => {
  let submissionId: string;
  let beforeReview: { state: string; readiness: string };

  it('una primera entrega queda por revisar: el control no cambia y no deja evento', async () => {
    const before = await detail();
    submissionId = (await submit('v1').expect(201)).body.data.id;
    expect(await detail()).toEqual(before);
    expect(await events('evidence_submission')).toHaveLength(0);
  });

  it('la revisión del admin_empresa la valida, mueve el control y deja el evento con el estado anterior y el nuevo, a su nombre', async () => {
    beforeReview = await detail();
    await review(a.agent, submissionId).expect(200);
    const after = await detail();
    expect(after).not.toEqual(beforeReview);
    const [event, ...rest] = await events('evidence_review');
    expect(rest).toHaveLength(0);
    expect(event.user_id).toBe(adminId);
    expect(event.previous_value).toMatchObject(beforeReview);
    expect(event.new_value).toMatchObject({ ...after, control_id: controlId, service_id: a.serviceId, cause: 'evidence_review' });
  });

  it('el auditor no revisa (403): no mueve el estado ni deja evento', async () => {
    const before = (await events('evidence_review')).length;
    await review(auditor, submissionId).expect(403);
    expect(await events('evidence_review')).toHaveLength(before);
  });

  it('una versión nueva devuelve la prueba a revisión: mueve el control de vuelta y deja su evento', async () => {
    const validated = await detail();
    await submit('v2').expect(201);
    const back = await detail();
    expect(back).toEqual(beforeReview);
    const [event, ...rest] = await events('evidence_submission');
    expect(rest).toHaveLength(0);
    expect(event.previous_value).toMatchObject(validated);
    expect(event.new_value).toMatchObject({ ...back, cause: 'evidence_submission' });
  });

  it('el historial encadena: cada evento parte de donde terminó el anterior', async () => {
    const all = await owner<{ previous_value: any; new_value: any }>(
      `select previous_value, new_value from audit.compliance_events where tenant_id = $1 and changed_field = 'control.state' and new_value->>'control_id' = $2 order by created_at, id`,
      [a.companyId, controlId],
    );
    expect(all.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < all.length; i++) {
      expect({ state: all[i].previous_value.state, readiness: all[i].previous_value.readiness }).toEqual({ state: all[i - 1].new_value.state, readiness: all[i - 1].new_value.readiness });
    }
  });
});
