import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { controlStateOf } from '../support/controles';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { FileStorage } from '../../src/common/storage/file-storage';
import { dosEmpresas, Tenant } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-500 · D147 · G-10 · El admin_empresa cambia la periodicidad de un control (todos sus requisitos) con una justificación (contracts/cumplimiento/controles.md).
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let responsable: Agent;
let delegado: Agent;
const storage = new StorageEnMemoria();
let controlId: string;
let retiredId: string;
let TARGET = 'monthly';
const ALERT_DAYS: Record<string, number> = { monthly: 5, quarterly: 15, semiannual: 20 };

const path = (id = controlId) => `/v1/controls/${id}/periodicity`;
const JUSTIFICATION = 'Rotamos accesos cada mes por exigencia del contrato con el banco.';
const technical = async (agent: Agent = a.agent, id = controlId) => (await agent.get(`/v1/controls/${id}?view=technical`).expect(200)).body.data.technical;
const auditRows = () =>
  owner<{ before_state: any; after_state: any; user_agent: string }>(
    `select before_state, after_state, user_agent from audit.audit_logs where tenant_id = $1 and action = 'client_control.periodicity_set' order by created_at`,
    [a.companyId],
  );

async function cuenta(companyId: string, email: string, role: 'auditor' | 'responsable' | 'delegado'): Promise<void> {
  await owner(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role, is_internal)
     values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role, $5)`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role, role === 'delegado' ? true : null],
  );
}

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  ({ a, b, monkey } = await dosEmpresas(app));
  for (const role of ['auditor', 'responsable', 'delegado'] as const) await cuenta(a.companyId, `${role}-prd-${RUN}@cumplimiento.test`, role);
  auditor = await login(app, `auditor-prd-${RUN}@cumplimiento.test`);
  responsable = await login(app, `responsable-prd-${RUN}@cumplimiento.test`);
  delegado = await login(app, `delegado-prd-${RUN}@cumplimiento.test`);
  // Un control del catálogo con al menos dos requisitos de periodicidad distinta, y otro para darlo de baja.
  const rows = await owner<{ id: string }>(
    `select c.id from tenant.client_controls c join tenant.client_control_requirements r on r.client_control_id = c.id
      where c.service_id = $1 and c.control_id is not null group by c.id order by count(*) desc, c.own_code limit 2`,
    [a.serviceId],
  );
  controlId = rows[0].id;
  retiredId = rows[1].id;
});
afterAll(async () => {
  await app?.close();
});

describe('Periodicidad del control — cambiarla', () => {
  let suggested: Array<string | null>;

  it('antes de cambiarla usa la sugerida del catálogo y no hay cambio registrado', async () => {
    const t = await technical();
    expect(t.periodicity_change).toBeNull();
    expect(t.requirements.length).toBeGreaterThan(0);
    for (const r of t.requirements) expect(r).toMatchObject({ periodicity_source: 'catalog', suggested_periodicity: r.periodicity });
    suggested = t.requirements.map((r: any) => r.suggested_periodicity);
    // Una periodicidad distinta de las que ya trae el control, para que el cambio sea real.
    TARGET = ['monthly', 'quarterly', 'semiannual'].find((p) => !suggested.includes(p)) as string;
  });

  it('con la periodicidad y su justificación: 200 con el detalle ya recalculado; todos los requisitos quedan con ella', async () => {
    const res = await a.agent.put(path()).send({ periodicity: TARGET, justification: `  ${JUSTIFICATION}  ` }).expect(200);
    expect(res.body.message).toBeTruthy();
    const t = res.body.data.technical;
    expect(t.requirements.every((r: any) => r.periodicity === TARGET && r.periodicity_source === 'client')).toBe(true);
    expect(t.requirements.map((r: any) => r.suggested_periodicity)).toEqual(suggested);
    expect(t.periodicity_change).toEqual({ periodicity: TARGET, justification: JUSTIFICATION, changed_at: expect.any(String) });
    // Las pruebas con ventana traen su aviso previo (PR-06): el cierre menos los días de la periodicidad.
    const withWindow = t.requirements.flatMap((r: any) => r.tests).filter((x: any) => x.window_end);
    for (const test of withWindow) expect(new Date(`${test.window_end}T00:00:00Z`).getTime() - new Date(`${test.alert_at}T00:00:00Z`).getTime()).toBe(ALERT_DAYS[TARGET] * 86_400_000);
  });

  it('queda en el rastro con el valor anterior, el nuevo y la justificación', async () => {
    const rows = await auditRows();
    expect(rows).toHaveLength(1);
    expect(rows[0].before_state).toMatchObject({ id: controlId, source: 'catalog', justification: null });
    expect(rows[0].after_state).toMatchObject({ id: controlId, periodicity: TARGET, source: 'client', justification: JUSTIFICATION });
  });

  it('repetir la misma periodicidad no cambia nada ni deja rastro nuevo', async () => {
    await a.agent.put(path()).send({ periodicity: TARGET, justification: 'Otra razón' }).expect(200);
    expect(await auditRows()).toHaveLength(1);
    expect((await technical()).periodicity_change.justification).toBe(JUSTIFICATION);
  });

  it('null vuelve a la sugerida: cada requisito recupera la del catálogo y se borra el cambio', async () => {
    const res = await a.agent.put(path()).send({ periodicity: null, justification: 'Volvemos a la del catálogo.' }).expect(200);
    const t = res.body.data.technical;
    expect(t.periodicity_change).toBeNull();
    expect(t.requirements.map((r: any) => r.periodicity)).toEqual(suggested);
    expect(t.requirements.every((r: any) => r.periodicity_source === 'catalog')).toBe(true);
    const rows = await auditRows();
    expect(rows).toHaveLength(2);
    expect(rows[1].before_state).toMatchObject({ periodicity: TARGET, source: 'client' });
    expect(rows[1].after_state).toMatchObject({ source: 'catalog' });
  });

  it('el cambio es del control: los demás controles del servicio conservan la suya', async () => {
    await a.agent.put(path()).send({ periodicity: 'weekly', justification: JUSTIFICATION }).expect(200);
    const other = await owner<{ periodicity: string | null }>(`select r.periodicity from tenant.client_control_requirements r where r.client_control_id = $1`, [retiredId]);
    const catalog = await owner<{ periodicity: string | null }>(
      `select cr.periodicity from tenant.client_control_requirements r join catalog.control_requirements cr on cr.id = r.control_requirement_id where r.client_control_id = $1`,
      [retiredId],
    );
    expect(other.map((o) => o.periodicity)).toEqual(catalog.map((o) => o.periodicity));
    await a.agent.put(path()).send({ periodicity: null, justification: 'Volvemos.' }).expect(200);
  });
});

describe('Periodicidad del control — el cambio mueve el estado (D91)', () => {
  const ALL_OK = { type_ok: true, period_ok: true, valid_ok: true, approved_ok: true, signed_ok: true, content_ok: true, review: 'human_validated' as const };
  const state = async (id: string) => (await a.agent.get(`/v1/controls/${id}?view=technical`).expect(200)).body.data.technical;
  const stateOf = async (id: string) => controlStateOf(await state(id));

  it('con una evidencia validada fuera de la ventana nueva, el control pasa a Vencido y queda el evento a nombre del admin_empresa', async () => {
    // Un control del catálogo cuyos requisitos no son de calendario y con una prueba documental: la evidencia vale mientras no haya ventana.
    const [pick] = await owner<{ id: string; test_id: string }>(
      `select c.id, min(crt.test_id::text)::uuid as test_id
         from tenant.client_controls c
         join tenant.client_control_requirements r on r.client_control_id = c.id
         join catalog.control_requirement_tests crt on crt.control_requirement_id = r.control_requirement_id
         join catalog.tests t on t.id = crt.test_id and t.type = 'documentary'
        where c.service_id = $1 and c.control_id is not null and c.is_active and c.id not in ($2, $3)
          and not exists (select 1 from tenant.client_control_requirements x where x.client_control_id = c.id and x.periodicity in ('daily','weekly','monthly','bimonthly','quarterly','semiannual'))
        group by c.id order by c.id limit 1`,
      [a.serviceId, controlId, retiredId],
    );
    const id = pick.id;
    const sub = (await a.agent.post(`/v1/controls/${id}/tests/${pick.test_id}/evidence`).attach('file', Buffer.from(`%PDF-1.7\n% periodicidad ${RUN}\n`), 'p.pdf').expect(201)).body.data.id;
    await a.agent.put(`/v1/evidence-submissions/${sub}/review`).send(ALL_OK).expect(200);
    await owner(`update tenant.evidence_submissions set submitted_at = now() - interval '5 days' where evidence_requirement_id in (select id from tenant.evidence_requirements where client_control_id = $1)`, [id]);
    const before = await stateOf(id);
    await a.agent.put(path(id)).send({ periodicity: 'daily', justification: JUSTIFICATION }).expect(200);
    const after = await stateOf(id);
    expect(after).not.toBe(before);
    const events = await owner<{ previous_value: any; new_value: any; user_id: string | null }>(
      `select previous_value, new_value, user_id from audit.compliance_events where tenant_id = $1 and changed_field = 'control.state' and new_value->>'control_id' = $2 and new_value->>'cause' = 'periodicity_changed'`,
      [a.companyId, id],
    );
    expect(events).toHaveLength(1);
    expect(events[0].user_id).not.toBeNull();
    expect(events[0].previous_value).toMatchObject({ state: before });
    expect(events[0].new_value).toMatchObject({ state: after, service_id: a.serviceId });
  });
});

describe('Periodicidad del control — validación (422)', () => {
  const fields = (res: request.Response) => res.body.error.fields.map((f: any) => [f.field, f.code]);

  it('justificación y periodicidad son obligatorias', async () => {
    expect(fields(await a.agent.put(path()).send({}).expect(422))).toEqual([['periodicity', 'required'], ['justification', 'required']]);
    expect(fields(await a.agent.put(path()).send({ periodicity: TARGET, justification: '   ' }).expect(422))).toEqual([['justification', 'required']]);
  });

  it('un valor que no es del enum, o una justificación de más de 1000 caracteres', async () => {
    expect(fields(await a.agent.put(path()).send({ periodicity: 'cada_rato', justification: 'x' }).expect(422))).toEqual([['periodicity', 'enum.invalid']]);
    expect(fields(await a.agent.put(path()).send({ periodicity: TARGET, justification: 'x'.repeat(1001) }).expect(422))).toEqual([['justification', 'string.max']]);
    await a.agent.put(path()).send({ periodicity: TARGET, justification: 'x'.repeat(1000) }).expect(200);
    await a.agent.put(path()).send({ periodicity: null, justification: 'Volvemos.' }).expect(200);
  });

  it('un control propio no tiene requisitos del catálogo: periodicity.own_control', async () => {
    const own = (await a.agent.post(`/v1/services/${a.serviceId}/controls`).send({ name: `Propio ${RUN}`, interpretation: 'Nuestro control.', trust_criterion: 'security' }).expect(201)).body.data.id;
    const res = await a.agent.put(path(own)).send({ periodicity: TARGET, justification: 'x' }).expect(422);
    expect(fields(res)).toEqual([['periodicity', 'periodicity.own_control']]);
    expect(res.body.error.fields[0].message).toBeTruthy();
  });

  it('una validación fallida no deja rastro', async () => {
    const n = (await auditRows()).length;
    await a.agent.put(path()).send({ periodicity: 'cada_rato', justification: 'x' }).expect(422);
    expect((await auditRows()).length).toBe(n);
  });
});

describe('Periodicidad del control — quién y sobre qué', () => {
  const body = () => ({ periodicity: TARGET, justification: JUSTIFICATION });

  it('401 sin sesión', async () => {
    await request(app.getHttpServer()).put(path()).send(body()).expect(401);
  });

  it('solo admin_empresa: el responsable, el delegado, el auditor y el administrador de Monkey reciben 403', async () => {
    for (const agent of [responsable, delegado, auditor, monkey]) await agent.put(path()).send(body()).expect(403);
  });

  it('un control que no existe o un id que no es uuid es 404; el de otra empresa también (aislamiento)', async () => {
    await a.agent.put(path('00000000-0000-4000-8000-000000000000')).send(body()).expect(404);
    await a.agent.put(path('no-es-un-uuid')).send(body()).expect(404);
    await b.agent.put(path()).send(body()).expect(404);
  });

  it('un control dado de baja: 409 CONTROL_RETIRED', async () => {
    await a.agent.delete(`/v1/controls/${retiredId}`).expect(204);
    const res = await a.agent.put(path(retiredId)).send(body()).expect(409);
    expect(res.body.error.code).toBe('CONTROL_RETIRED');
  });
});
