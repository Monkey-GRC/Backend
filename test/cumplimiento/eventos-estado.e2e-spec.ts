import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { FileStorage } from '../../src/common/storage/file-storage';
import { controlPropioConPruebas, controlStateOf } from '../support/controles';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// D91 · Todo cambio de estado de un control deja un evento inmutable con el estado anterior y el nuevo (REQ-044). Aquí, el de la evidencia (una entrega que cuenta mueve el control) y el de la
// aprobación (MD-504, D132: aprobar mueve el estado de gestión); el auditor no aprueba. Los eventos del resultado manual, de la sonda y de la exclusión se prueban junto a su escritura.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let auditor: Agent;
let adminId: string;
let controlId: string;
let testId: string;
const storage = new StorageEnMemoria();

const pdf = (marca: string) => Buffer.from(`%PDF-1.7\n% evidencia ${marca} ${RUN}\n`);
const submit = (marca: string) => a.agent.post(`/v1/controls/${controlId}/tests/${testId}/evidence`).attach('file', pdf(marca), `${marca}.pdf`);
const approve = (agent: Agent) => agent.post(`/v1/controls/${controlId}/approval`).send({ decision: 'approve' });
const detail = async () => {
  const d = (await a.agent.get(`/v1/controls/${controlId}?view=technical`).expect(200)).body.data;
  return { state: controlStateOf(d.technical), readiness: d.readiness as string, management_state: d.management_state as string };
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

  // Un control cuya única prueba es la documental que se va a entregar: así validarla mueve al control entero.
  const [doc] = await owner<{ id: string }>(`select id from catalog.tests where code like 'T-DOC-%' order by code limit 1`);
  const c = { control: await controlPropioConPruebas(a.companyId, a.serviceId, `E${RUN.toUpperCase()}`, [doc.id]), test: doc.id };
  controlId = c.control;
  testId = c.test;
});
afterAll(async () => {
  await app?.close();
});

describe('La evidencia y la aprobación mueven el estado de un control y queda el evento (D91)', () => {
  let beforeUpload: { state: string; readiness: string; management_state: string };
  let afterUpload: { state: string; readiness: string; management_state: string };

  it('una primera entrega cuenta (D132): mueve el control a «por aprobar» y deja el evento a nombre de quien la subió', async () => {
    beforeUpload = await detail();
    expect(beforeUpload.management_state).toBe('non_compliant');
    await submit('v1').expect(201);
    afterUpload = await detail();
    expect(afterUpload).not.toEqual(beforeUpload);
    expect(afterUpload.management_state).toBe('pending_approval');
    const [event, ...rest] = await events('evidence_submission');
    expect(rest).toHaveLength(0);
    expect(event.user_id).toBe(adminId);
    expect(event.previous_value).toMatchObject(beforeUpload);
    expect(event.new_value).toMatchObject({ ...afterUpload, control_id: controlId, service_id: a.serviceId, cause: 'evidence_submission' });
  });

  it('el admin_empresa aprueba (no hay responsable): el estado de gestión pasa a aprobado y deja el evento a su nombre', async () => {
    await approve(a.agent).expect(200);
    const after = await detail();
    expect(after.management_state).toBe('approved');
    const [event, ...rest] = await events('control_approval');
    expect(rest).toHaveLength(0);
    expect(event.user_id).toBe(adminId);
    expect(event.previous_value).toMatchObject(afterUpload);
    expect(event.new_value).toMatchObject({ ...after, control_id: controlId, cause: 'control_approval' });
  });

  it('el auditor no aprueba (403): no mueve el estado ni deja evento', async () => {
    const before = (await events('control_approval')).length;
    await approve(auditor).expect(403);
    expect(await events('control_approval')).toHaveLength(before);
  });

  it('una versión nueva que no cambia el resultado no mueve el control, no quita la aprobación y no deja evento', async () => {
    const before = await detail();
    await submit('v2').expect(201);
    expect(await detail()).toEqual(before);
    expect(await events('evidence_submission')).toHaveLength(1);
  });

  it('el historial encadena: cada evento parte de donde terminó el anterior', async () => {
    const all = await owner<{ previous_value: any; new_value: any }>(
      `select previous_value, new_value from audit.compliance_events where tenant_id = $1 and changed_field = 'control.state' and new_value->>'control_id' = $2 order by created_at, id`,
      [a.companyId, controlId],
    );
    expect(all.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < all.length; i++) {
      expect({ state: all[i].previous_value.state, readiness: all[i].previous_value.readiness, management_state: all[i].previous_value.management_state }).toEqual({
        state: all[i - 1].new_value.state, readiness: all[i - 1].new_value.readiness, management_state: all[i - 1].new_value.management_state,
      });
    }
  });
});
