import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-150 (control propio) y MD-118 (proponer cambios) · contracts/modules/compliance-controls.md. Cada prueba sale por HTTP con la sesión real de cada rol.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let funcional: Agent;
let funcionalId: string;
let adminId: string;
let controls: Array<Record<string, any>>;
const list = (t: Tenant, q = '') => `/v1/services/${t.serviceId}/controls${q}`;

async function cuenta(companyId: string, email: string, role: 'auditor' | 'funcional'): Promise<string> {
  const rows = await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role)
     values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  );
  return rows[0].id;
}
// El `message` de cada campo ya viene traducido; aquí se compara lo que el contrato fija: el campo y su código. Una traducción que falta saldría como la clave.
const fields = (res: { body: any }) => {
  const list = res.body.error.fields as Array<{ field: string; code: string; message: string }>;
  for (const f of list) expect(f.message).not.toMatch(/^validation\./);
  return list.map(({ field, code }) => ({ field, code }));
};

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  await cuenta(a.companyId, `auditor-cmb-${RUN}@cumplimiento.test`, 'auditor');
  funcionalId = await cuenta(a.companyId, `funcional-cmb-${RUN}@cumplimiento.test`, 'funcional');
  auditor = await login(app, `auditor-cmb-${RUN}@cumplimiento.test`);
  funcional = await login(app, `funcional-cmb-${RUN}@cumplimiento.test`);
  controls = (await a.agent.get(list(a, '?page_size=100')).expect(200)).body.data.items;
  adminId = (await owner<{ id: string }>(`select id from platform.users where email = $1`, [a.email]))[0].id;
  // El funcional tiene asignada UNA acción.
  await owner(`insert into platform.user_control_assignments (id, company_id, user_id, client_control_id, assigned_by) values (gen_random_uuid(), $1, $2, $3, $4)`, [
    a.companyId, funcionalId, controls[0].id, adminId,
  ]);
});
afterAll(async () => {
  await app?.close();
});

const OWN = { name: 'Revisión trimestral de proveedores', interpretation: 'Cada trimestre TI revisa que los proveedores críticos cumplan el contrato.', trust_criterion: 'security' };

describe('MD-150 · crear un control propio', () => {
  it('nace pendiente de aprobación, con su código C01 y solo documental; cuenta desde que se crea', async () => {
    const before = (await a.agent.get(list(a)).expect(200)).body.data.total;
    const res = await a.agent.post(list(a)).send(OWN).expect(201);
    const c = res.body.data;
    expect(c).toMatchObject({
      own_code: 'C01',
      name: OWN.name,
      origin: 'own',
      type: 'manual',
      trust_criteria: ['security'],
      approval: 'pending',
      has_pending_change: true,
      interpretation: { text: OWN.interpretation, is_customized: true },
      dimensions: [{ dimension: 'policy', applies: true, type: 'manual', reason_not_applicable: null }],
      readiness: 'not_measured',
      progress: { done: 0, total: 1 },
      coverage: { measured: 0, applicable: 1 },
      evidence: [],
      assigned_to: null,
    });
    // aparece en la lista junto a los del catálogo, y cuenta
    expect((await a.agent.get(list(a)).expect(200)).body.data.total).toBe(before + 1);
    const own = (await a.agent.get(list(a, '?origin=own&approval=pending')).expect(200)).body.data.items;
    expect(own.map((x: any) => x.id)).toEqual([c.id]);
    expect(own[0]).toMatchObject({ own_code: 'C01', origin: 'own' });
  });

  it('el siguiente control propio es C02 y los del catálogo no muestran su código', async () => {
    const res = await a.agent.post(list(a)).send({ ...OWN, name: 'Segundo control propio', trust_criterion: 'confidentiality' }).expect(201);
    expect(res.body.data.own_code).toBe('C02');
    const all = (await a.agent.get(list(a, '?page_size=100')).expect(200)).body.data.items as Array<Record<string, any>>;
    expect(all.filter((x) => x.origin === 'catalog').every((x) => x.own_code === null)).toBe(true);
    expect(all.filter((x) => x.origin === 'own').map((x) => x.own_code).sort()).toEqual(['C01', 'C02']);
    expect(JSON.stringify(all)).not.toMatch(/\b[A-Z]{2,4}-\d{1,3}\b/);
  });

  it('queda todo registrado: control propio, propuesta de creación, evento de cumplimiento y auditoría', async () => {
    const c = (await a.agent.post(list(a)).send({ ...OWN, name: 'Tercero', trust_criterion: 'availability' }).expect(201)).body.data;
    const [row] = await owner(`select control_id, name, trust_criterion::text tc, type::text type, is_active from tenant.client_controls where id = $1`, [c.id]);
    expect(row).toEqual({ control_id: null, name: 'Tercero', tc: 'availability', type: 'manual', is_active: true });
    const [change] = await owner(`select change_type::text t, status::text s, requested_by from tenant.client_control_changes where client_control_id = $1`, [c.id]);
    expect(change).toEqual({ t: 'create', s: 'pending', requested_by: adminId });
    const [{ n: audit }] = await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where action = 'client_control.create' and tenant_id = $1 and (after_state->>'id') = $2`, [a.companyId, c.id]);
    expect(audit).toBe(1);
    const [{ n: events }] = await owner<{ n: number }>(`select count(*)::int n from audit.compliance_events where tenant_id = $1 and changed_field = 'client_control.create' and (new_value->>'client_control_id') = $2`, [a.companyId, c.id]);
    expect(events).toBe(1);
  });

  it('la vista técnica del auditor no inventa un código de catálogo para un control propio', async () => {
    const own = (await auditor.get(list(a, '?origin=own&view=technical')).expect(200)).body.data.items[0];
    expect(own.technical).toMatchObject({ control_code: null, requirement_codes: [], points_of_focus: [] });
  });

  it('valida por campo y devuelve todos los errores a la vez', async () => {
    const res = await a.agent.post(list(a)).send({ interpretation: '', trust_criterion: 'privacy', dimensions: ['server', 'policy'] }).expect(422);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(fields(res)).toEqual(
      expect.arrayContaining([
        { field: 'name', code: 'required' },
        { field: 'interpretation', code: 'required' },
      ]),
    );
  });

  it('una categoría que el servicio no contrató y una dimensión que no es documental se rechazan con su código', async () => {
    const res = await a.agent.post(list(a)).send({ ...OWN, trust_criterion: 'privacy', dimensions: ['server', 'policy'] }).expect(422);
    expect(fields(res)).toEqual(
      expect.arrayContaining([
        { field: 'dimensions[0]', code: 'dimension.policy_only' },
        { field: 'trust_criterion', code: 'category.not_in_scope' },
      ]),
    );
    expect(fields(res)).not.toContainEqual({ field: 'dimensions[1]', code: 'dimension.policy_only' });
  });

  it('solo el administrador de la empresa lo crea', async () => {
    await funcional.post(list(a)).send(OWN).expect(403);
    await auditor.post(list(a)).send(OWN).expect(403);
    await monkey.post(list(a)).send(OWN).expect(403);
  });

  it('el servicio de otra empresa no existe: 404', async () => {
    await a.agent.post(list(b)).send(OWN).expect(404);
  });

  it('la base impone que un control propio lleve nombre y categoría', async () => {
    await expect(
      owner(
        `insert into tenant.client_controls (id, tenant_id, service_id, control_id, own_code, client_interpretation, type) values (gen_random_uuid(), $1, $2, null, 'C99', 'x', 'manual')`,
        [a.companyId, a.serviceId],
      ),
    ).rejects.toThrow(/client_controls_own_has_name_and_category/);
  });
});

describe('MD-118 · proponer un cambio', () => {
  // Una acción del catálogo, la primera de la lista (la que tiene asignada el funcional).
  const target = () => controls[0];
  const propose = (agent: Agent, id: string, body: object) => agent.post(`/v1/controls/${id}/changes`).send(body);

  it('proponer una interpretación nueva deja una propuesta pendiente y la acción no cambia ni deja de contar', async () => {
    const before = (await a.agent.get(`/v1/controls/${target().id}`).expect(200)).body.data;
    const res = await propose(a.agent, target().id, { change_type: 'edit_interpretation', proposed_values: { interpretation: 'Los accesos se piden por el formulario de TI.' } }).expect(201);
    expect(res.body.data).toMatchObject({
      control_id: target().id,
      change_type: 'edit_interpretation',
      status: 'pending',
      proposed_values: { interpretation: 'Los accesos se piden por el formulario de TI.' },
      requested_by: { id: adminId },
      decided_by: null,
      decision_note: null,
      decided_at: null,
    });
    const after = (await a.agent.get(`/v1/controls/${target().id}`).expect(200)).body.data;
    expect(after.interpretation).toEqual(before.interpretation); // sigue como estaba
    expect(after.progress).toEqual(before.progress); // y sigue contando igual
    expect(after.readiness).toBe(before.readiness);
    expect(after.has_pending_change).toBe(true);
    expect(before.has_pending_change).toBe(false);
  });

  it('dos propuestas pendientes del mismo tipo sobre la misma acción son un conflicto; de otro tipo, no', async () => {
    const dup = await propose(a.agent, target().id, { change_type: 'edit_interpretation', proposed_values: { interpretation: 'Otra más.' } }).expect(409);
    expect(dup.body.error.code).toBe('CHANGE_ALREADY_PENDING');
    await propose(a.agent, target().id, { change_type: 'retire' }).expect(201);
  });

  it('proponer las dimensiones normaliza lo que se guarda; una que no aplica lleva su motivo', async () => {
    const other = controls[1];
    const res = await propose(a.agent, other.id, {
      change_type: 'edit_dimensions',
      proposed_values: { dimensions: [{ dimension: 'policy', applies: true }, { dimension: 'database', applies: false, reason_not_applicable: ' No operamos bases de datos. ' }] },
    }).expect(201);
    expect(res.body.data.proposed_values).toEqual({
      dimensions: [
        { dimension: 'policy', applies: true, reason_not_applicable: null },
        { dimension: 'database', applies: false, reason_not_applicable: 'No operamos bases de datos.' },
      ],
    });
  });

  it('valida por campo: sin motivo, dimensión desconocida, repetida, vacía o interpretación vacía', async () => {
    const id = controls[2].id;
    const noReason = await propose(a.agent, id, { change_type: 'edit_dimensions', proposed_values: { dimensions: [{ dimension: 'policy', applies: true }, { dimension: 'server', applies: false }] } }).expect(422);
    expect(fields(noReason)).toEqual([{ field: 'proposed_values.dimensions[1].reason_not_applicable', code: 'reason.required' }]);
    const bad = await propose(a.agent, id, { change_type: 'edit_dimensions', proposed_values: { dimensions: [{ dimension: 'luna', applies: true }, { dimension: 'cloud', applies: true }, { dimension: 'cloud', applies: true }] } }).expect(422);
    expect(fields(bad)).toEqual(
      expect.arrayContaining([
        { field: 'proposed_values.dimensions[0].dimension', code: 'enum.invalid' },
        { field: 'proposed_values.dimensions[2].dimension', code: 'array.unique' },
      ]),
    );
    expect(fields(await propose(a.agent, id, { change_type: 'edit_dimensions', proposed_values: { dimensions: [] } }).expect(422))).toEqual([{ field: 'proposed_values.dimensions', code: 'array.min' }]);
    expect(fields(await propose(a.agent, id, { change_type: 'edit_interpretation', proposed_values: { interpretation: '   ' } }).expect(422))).toEqual([{ field: 'proposed_values.interpretation', code: 'required' }]);
  });

  it('«create» no se propone aquí: nace con POST …/controls', async () => {
    const res = await propose(a.agent, controls[2].id, { change_type: 'create' }).expect(422);
    expect(fields(res)).toEqual([{ field: 'change_type', code: 'enum.invalid' }]);
  });

  it('el funcional propone solo sobre la acción que tiene asignada; sobre otra, 403', async () => {
    await propose(funcional, controls[0].id, { change_type: 'edit_interpretation', proposed_values: { interpretation: 'Texto del dueño del control.' } }).expect(409); // ya hay una pendiente: pasó el permiso
    await propose(funcional, controls[3].id, { change_type: 'retire' }).expect(403);
  });

  it('el auditor y admin_monkey no proponen', async () => {
    await propose(auditor, controls[3].id, { change_type: 'retire' }).expect(403);
    await propose(monkey, controls[3].id, { change_type: 'retire' }).expect(403);
  });

  it('una acción de otra empresa no existe: 404, también para listar sus propuestas', async () => {
    const bId = (await b.agent.get(list(b)).expect(200)).body.data.items[0].id;
    await propose(a.agent, bId, { change_type: 'retire' }).expect(404);
    await a.agent.get(`/v1/controls/${bId}/changes`).expect(404);
    await propose(a.agent, 'no-es-un-uuid', { change_type: 'retire' }).expect(404);
  });

  it('una acción dada de baja no admite propuestas', async () => {
    await owner(`update tenant.client_controls set is_active = false where id = $1`, [controls[5].id]);
    const res = await propose(a.agent, controls[5].id, { change_type: 'retire' }).expect(409);
    expect(res.body.error.code).toBe('CONTROL_RETIRED');
  });

  it('cada propuesta deja su rastro de auditoría', async () => {
    const [{ n }] = await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where action = 'client_control_change.request' and tenant_id = $1 and (after_state->>'control_id') = $2`, [a.companyId, target().id]);
    expect(n).toBeGreaterThanOrEqual(2);
  });

  it('una vez decidida la propuesta, se puede proponer otra del mismo tipo (el índice solo frena las pendientes)', async () => {
    await owner(
      `update tenant.client_control_changes set status = 'approved', decided_by = $2, decided_at = now() where client_control_id = $1 and change_type = 'retire' and status = 'pending'`,
      [target().id, adminId],
    );
    await propose(a.agent, target().id, { change_type: 'retire' }).expect(201);
  });

  it('la base no acepta una propuesta decidida sin quién la decidió, ni un rechazo sin motivo', async () => {
    await expect(owner(`update tenant.client_control_changes set status = 'approved' where client_control_id = $1 and change_type = 'edit_dimensions'`, [controls[1].id])).rejects.toThrow(/decision_consistent/);
    await expect(
      owner(`update tenant.client_control_changes set status = 'rejected', decided_by = $2, decided_at = now() where client_control_id = $1 and change_type = 'edit_dimensions'`, [controls[1].id, adminId]),
    ).rejects.toThrow(/reject_needs_note/);
  });
});

describe('MD-118 · leer las propuestas', () => {
  it('el administrador las lista paginadas, de la más reciente a la más antigua, y filtra por estado', async () => {
    const res = await a.agent.get(`/v1/controls/${controls[0].id}/changes`).expect(200);
    const { items, total } = res.body.data;
    expect(total).toBeGreaterThanOrEqual(3);
    expect(items[0]).toHaveProperty('proposed_values');
    const dates = items.map((i: any) => Date.parse(i.requested_at));
    expect(dates).toEqual([...dates].sort((x, y) => y - x));
    const pending = (await a.agent.get(`/v1/controls/${controls[0].id}/changes?status=pending`).expect(200)).body.data.items;
    expect(pending.every((i: any) => i.status === 'pending')).toBe(true);
    expect((await a.agent.get(`/v1/controls/${controls[0].id}/changes?status=approved`).expect(200)).body.data.items.every((i: any) => i.status === 'approved')).toBe(true);
    await a.agent.get(`/v1/controls/${controls[0].id}/changes?status=raro`).expect(422);
  });

  it('el auditor las lee; el funcional solo las de su acción', async () => {
    await auditor.get(`/v1/controls/${controls[0].id}/changes`).expect(200);
    await funcional.get(`/v1/controls/${controls[0].id}/changes`).expect(200);
    await funcional.get(`/v1/controls/${controls[3].id}/changes`).expect(403);
    await monkey.get(`/v1/controls/${controls[0].id}/changes`).expect(403);
  });
});
