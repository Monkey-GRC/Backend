import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-150 (control propio) y D96 (editar y dar de baja un control, directo) · contracts/modules/compliance-controls.md. Cada prueba sale por HTTP con la sesión real de cada rol.
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
const realInsert = auditInsert.insertAuditLog;
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
  it('nace aprobado, con su código C01 y solo documental; cuenta desde que se crea', async () => {
    const before = (await a.agent.get(list(a)).expect(200)).body.data.total;
    const res = await a.agent.post(list(a)).send(OWN).expect(201);
    const c = res.body.data;
    expect(c).toMatchObject({
      own_code: 'C01',
      name: OWN.name,
      origin: 'own',
      type: 'manual',
      trust_criteria: ['security'],
      approval: 'approved',
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
    const own = (await a.agent.get(list(a, '?origin=own')).expect(200)).body.data.items;
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

  it('queda todo registrado: control propio, evento de cumplimiento y auditoría, sin propuesta', async () => {
    const c = (await a.agent.post(list(a)).send({ ...OWN, name: 'Tercero', trust_criterion: 'availability' }).expect(201)).body.data;
    const [row] = await owner(`select control_id, name, trust_criterion::text tc, type::text type, is_active from tenant.client_controls where id = $1`, [c.id]);
    expect(row).toEqual({ control_id: null, name: 'Tercero', tc: 'availability', type: 'manual', is_active: true });
    expect(await owner('select 1 from tenant.client_control_changes where client_control_id = $1', [c.id])).toHaveLength(0);
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

const dimsOf = (c: any) => Object.fromEntries(c.dimensions.map((d: any) => [d.dimension, d]));
const patch = (agent: Agent, id: string, body: object) => agent.patch(`/v1/controls/${id}`).send(body);
const detail = async (id: string) => (await a.agent.get(`/v1/controls/${id}`).expect(200)).body.data;
const auditRows = (action: string, id: string) =>
  owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2 and (before_state->>'id') = $3`, [a.companyId, action, id]).then((r) => r[0].n);

describe('D96 · editar un control: directo, sin propuesta', () => {
  let catalogId: string;
  let catalogDims: string[];
  let ownId: string;

  beforeAll(async () => {
    for (const c of controls) {
      const d = await detail(c.id);
      if (d.origin === 'catalog' && d.dimensions.length >= 2 && d.dimensions.every((x: any) => x.applies)) {
        catalogId = c.id;
        catalogDims = d.dimensions.map((x: any) => x.dimension);
        break;
      }
    }
    expect(catalogId).toBeTruthy();
    ownId = (await a.agent.post(list(a)).send({ ...OWN, name: 'Para editar' }).expect(201)).body.data.id;
  });

  it('cambia la interpretación al instante y queda marcada como personalizada, con su auditoría', async () => {
    const res = await patch(a.agent, catalogId, { interpretation: { text: 'Nuestra forma de cumplirlo.' } }).expect(200);
    expect(res.body.data.interpretation).toEqual({ text: 'Nuestra forma de cumplirlo.', is_customized: true });
    expect((await detail(catalogId)).interpretation.text).toBe('Nuestra forma de cumplirlo.');
    expect(await auditRows('client_control.update', catalogId)).toBe(1);
  });

  it('quitar una dimensión exige el motivo, la deja sin aplicar y cambia lo que se mide (con su evento)', async () => {
    const target = catalogDims[1];
    const sin = await patch(a.agent, catalogId, { dimensions: [{ dimension: target, applies: false }] }).expect(422);
    expect(fields(sin)).toEqual([{ field: 'dimensions[0].reason_not_applicable', code: 'reason.required' }]);
    const before = await detail(catalogId);
    const res = await patch(a.agent, catalogId, { dimensions: [{ dimension: target, applies: false, reason_not_applicable: 'No operamos esa parte.' }] }).expect(200);
    expect(dimsOf(res.body.data)[target]).toMatchObject({ applies: false, type: null, reason_not_applicable: 'No operamos esa parte.' });
    expect(dimsOf(res.body.data)[catalogDims[0]].applies).toBe(true);
    expect(res.body.data.progress.total).toBeLessThanOrEqual(before.progress.total);
    const [{ n }] = await owner<{ n: number }>(`select count(*)::int n from audit.compliance_events where tenant_id = $1 and changed_field = 'client_control.update' and (new_value->>'client_control_id') = $2`, [a.companyId, catalogId]);
    expect(n).toBe(1);
    // y se puede volver a aplicar
    const back = await patch(a.agent, catalogId, { dimensions: [{ dimension: target, applies: true }] }).expect(200);
    expect(dimsOf(back.body.data)[target]).toMatchObject({ applies: true, reason_not_applicable: null });
  });

  it('validación por campo: nada que cambiar, dimensión desconocida, repetida o que el control no lleva', async () => {
    expect(fields(await patch(a.agent, catalogId, {}).expect(422))).toEqual([{ field: 'interpretation', code: 'required' }]);
    expect(fields(await patch(a.agent, catalogId, { interpretation: { text: '  ' } }).expect(422))).toEqual([{ field: 'interpretation.text', code: 'required' }]);
    expect(fields(await patch(a.agent, catalogId, { interpretation: { text: 'x'.repeat(4001) } }).expect(422))).toEqual([{ field: 'interpretation.text', code: 'string.max' }]);
    expect(fields(await patch(a.agent, catalogId, { dimensions: [] }).expect(422))).toEqual([{ field: 'dimensions', code: 'array.min' }]);
    expect(fields(await patch(a.agent, catalogId, { dimensions: [{ dimension: 'otra', applies: true }, { dimension: 'cloud', applies: 'si' }] }).expect(422))).toEqual(
      expect.arrayContaining([{ field: 'dimensions[0].dimension', code: 'enum.invalid' }, { field: 'dimensions[1].applies', code: 'boolean.invalid' }]),
    );
    expect(fields(await patch(a.agent, catalogId, { dimensions: [{ dimension: catalogDims[0], applies: true }, { dimension: catalogDims[0], applies: true }] }).expect(422))).toContainEqual({ field: 'dimensions[1].dimension', code: 'array.unique' });
    const missing = ['policy', 'server', 'database', 'app', 'cloud'].find((d) => !catalogDims.includes(d));
    if (missing) expect(fields(await patch(a.agent, catalogId, { dimensions: [{ dimension: missing, applies: true }] }).expect(422))).toEqual([{ field: 'dimensions[0].dimension', code: 'dimension.not_in_control' }]);
  });

  it('un control propio solo admite la dimensión documental', async () => {
    expect(fields(await patch(a.agent, ownId, { dimensions: [{ dimension: 'server', applies: true }] }).expect(422))).toContainEqual({ field: 'dimensions[0].dimension', code: 'dimension.policy_only' });
    await patch(a.agent, ownId, { interpretation: { text: 'Cada semestre.' } }).expect(200);
  });

  it('solo el administrador de la empresa; otra empresa y un id inválido, 404', async () => {
    await patch(funcional, catalogId, { interpretation: { text: 'x' } }).expect(403);
    await patch(auditor, catalogId, { interpretation: { text: 'x' } }).expect(403);
    await patch(monkey, catalogId, { interpretation: { text: 'x' } }).expect(403);
    await patch(b.agent, catalogId, { interpretation: { text: 'x' } }).expect(404);
    await patch(a.agent, 'no-es-uuid', { interpretation: { text: 'x' } }).expect(404);
  });
});

describe('D96 · dar de baja un control: baja, no borrado', () => {
  let id: string;
  beforeAll(async () => {
    id = (await a.agent.post(list(a)).send({ ...OWN, name: 'Para dar de baja' }).expect(201)).body.data.id;
  });

  it('solo el administrador de la empresa; otra empresa y un id inválido, 404', async () => {
    await funcional.delete(`/v1/controls/${id}`).expect(403);
    await auditor.delete(`/v1/controls/${id}`).expect(403);
    await monkey.delete(`/v1/controls/${id}`).expect(403);
    await b.agent.delete(`/v1/controls/${id}`).expect(404);
    await a.agent.delete('/v1/controls/no-es-uuid').expect(404);
  });

  it('204: deja de contar y de verse, la fila se conserva, y queda su auditoría y su evento', async () => {
    const before = (await a.agent.get(list(a, '?page_size=100')).expect(200)).body.data.total;
    await a.agent.delete(`/v1/controls/${id}`).expect(204);
    expect((await a.agent.get(list(a, '?page_size=100')).expect(200)).body.data.total).toBe(before - 1);
    await a.agent.get(`/v1/controls/${id}`).expect(404);
    expect((await owner(`select is_active from tenant.client_controls where id = $1`, [id]))[0]).toEqual({ is_active: false });
    expect(await auditRows('client_control.retire', id)).toBe(1);
    const [{ n }] = await owner<{ n: number }>(`select count(*)::int n from audit.compliance_events where tenant_id = $1 and changed_field = 'client_control.retire' and (new_value->>'client_control_id') = $2`, [a.companyId, id]);
    expect(n).toBe(1);
  });

  it('darlo de baja otra vez, o editarlo, es 409 CONTROL_RETIRED', async () => {
    expect((await a.agent.delete(`/v1/controls/${id}`).expect(409)).body.error.code).toBe('CONTROL_RETIRED');
    expect((await patch(a.agent, id, { interpretation: { text: 'x' } }).expect(409)).body.error.code).toBe('CONTROL_RETIRED');
  });

  it('si el rastro falla, la baja se revierte', async () => {
    const other = (await a.agent.post(list(a)).send({ ...OWN, name: 'Baja con fallo' }).expect(201)).body.data.id;
    const spy = jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    await a.agent.delete(`/v1/controls/${other}`).expect(500);
    spy.mockRestore();
    expect((await owner(`select is_active from tenant.client_controls where id = $1`, [other]))[0]).toEqual({ is_active: true });
    expect(await auditRows('client_control.retire', other)).toBe(0);
  });
});
