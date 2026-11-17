import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';
import { asignarControl, dimensionesDe } from '../support/asignaciones';

// MD-208 · GET /v1/services/{service_id}/evidence: la evidencia de todos los controles visibles del servicio en una petición (contracts/cumplimiento/evidencia.md).
type Agent = Awaited<ReturnType<typeof login>>;
type Item = { control_id: string; id: string; sequence: number; submissions: unknown[]; technical?: unknown };
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let auditor: Agent;
let responsable: Agent;
let delegado: Agent;
let controlR: string; // dueño: el responsable
let controlD: string; // ejecutor: el delegado
let controlBaja: string; // dado de baja
let todos: string[];
let responsableId: string;

async function cuenta(companyId: string, email: string, role: 'auditor' | 'responsable' | 'delegado'): Promise<string> {
  return (await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role, is_internal) values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role, $5) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role, role === 'delegado' ? true : null],
  ))[0].id;
}
const url = (serviceId: string, q = '') => `/v1/services/${serviceId}/evidence${q}`;
const itemsOf = (res: { body: { data: { items: Item[] } } }) => res.body.data.items;
const controlsOf = (items: Item[]) => [...new Set(items.map((i) => i.control_id))];

beforeAll(async () => {
  app = await bootApp();
  ({ a, b } = await dosEmpresas(app));
  await cuenta(a.companyId, `auditor-sev-${RUN}@cumplimiento.test`, 'auditor');
  responsableId = await cuenta(a.companyId, `responsable-sev-${RUN}@cumplimiento.test`, 'responsable');
  const dueno2 = await cuenta(a.companyId, `responsable2-sev-${RUN}@cumplimiento.test`, 'responsable');
  const delegadoId = await cuenta(a.companyId, `delegado-sev-${RUN}@cumplimiento.test`, 'delegado');
  auditor = await login(app, `auditor-sev-${RUN}@cumplimiento.test`);
  responsable = await login(app, `responsable-sev-${RUN}@cumplimiento.test`);
  delegado = await login(app, `delegado-sev-${RUN}@cumplimiento.test`);

  const rows = await owner<{ id: string }>(
    `select cc.id from tenant.client_controls cc where cc.service_id = $1 and cc.is_active and exists (select 1 from tenant.evidence_requirements er where er.client_control_id = cc.id)
      order by cc.own_code limit 3`,
    [a.serviceId],
  );
  expect(rows.length).toBe(3);
  [controlR, controlD, controlBaja] = rows.map((r) => r.id);
  await asignarControl(a.companyId, controlR, responsableId);
  await asignarControl(a.companyId, controlD, dueno2, delegadoId);
  todos = (await owner<{ id: string }>(`select id from tenant.client_controls where service_id = $1 and is_active and id <> $2`, [a.serviceId, controlBaja])).map((r) => r.id);
  await owner(`update tenant.client_controls set is_active = false where id = $1`, [controlBaja]);
});
afterAll(async () => {
  await app?.close();
});

describe('MD-208 · evidencia de un servicio', () => {
  it('el administrador ve la de todos los controles vigentes, con control_id, por control y luego sequence; los dados de baja no salen', async () => {
    const items = itemsOf(await a.agent.get(url(a.serviceId)).expect(200));
    expect(items.length).toBeGreaterThan(0);
    expect(controlsOf(items)).toEqual(expect.arrayContaining([controlR, controlD]));
    expect(controlsOf(items)).not.toContain(controlBaja);
    for (const c of controlsOf(items)) expect(todos).toContain(c);
    // Cada control es un bloque contiguo y dentro va por sequence.
    const seen = new Set<string>();
    let last: Item | undefined;
    for (const i of items) {
      if (last?.control_id !== i.control_id) {
        expect(seen.has(i.control_id)).toBe(false);
        seen.add(i.control_id);
      } else expect(i.sequence).toBeGreaterThanOrEqual(last.sequence);
      last = i;
    }
    // Mismo ítem que devuelve el endpoint del control, más control_id.
    const single = (await a.agent.get(`/v1/controls/${controlR}/evidence`).expect(200)).body.data.items as Item[];
    const { control_id, ...rest } = items.find((i) => i.control_id === controlR && i.id === single[0].id)!;
    expect(control_id).toBe(controlR);
    expect(rest).toEqual(single[0]);
  });

  it('el auditor ve todo', async () => {
    const items = itemsOf(await auditor.get(url(a.serviceId)).expect(200));
    expect(controlsOf(items)).toEqual(expect.arrayContaining([controlR, controlD]));
  });

  it('el responsable solo ve lo de sus controles', async () => {
    expect(controlsOf(itemsOf(await responsable.get(url(a.serviceId)).expect(200)))).toEqual([controlR]);
  });

  // MD-208 · Debe dar lo mismo que GET /controls/{id}/evidence. El alcance es el control (D102): el dueño recibe todos sus requerimientos, sea cual sea la dimensión.
  it('el dueño de un control recibe todos sus requerimientos, y lo mismo que en el endpoint del control', async () => {
    // Se pasa un requerimiento de controlR a una dimensión que el control no lleva (base desechable): el alcance no depende de la dimensión.
    const dims = await dimensionesDe(controlR);
    const otra = ['server', 'database', 'app', 'cloud'].find((d) => !dims.includes(d))!;
    const [{ id: fuera }] = await owner<{ id: string }>(
      `update tenant.evidence_requirements set dimension = $2::catalog.dimension where id = (select id from tenant.evidence_requirements where client_control_id = $1 order by sequence desc limit 1) returning id`,
      [controlR, otra],
    );
    const parcial = controlR;
    await asignarControl(a.companyId, parcial, responsableId);
    const todas = (await a.agent.get(`/v1/controls/${parcial}/evidence`).expect(200)).body.data.items as Array<{ id: string }>;
    expect(todas.map((r) => r.id)).toContain(fuera);
    const individual = (await responsable.get(`/v1/controls/${parcial}/evidence`).expect(200)).body.data.items as Item[];
    const masivo = itemsOf(await responsable.get(url(a.serviceId)).expect(200)).filter((i) => i.control_id === parcial).map(({ control_id: _c, ...rest }) => rest);
    expect(masivo).toEqual(individual);
    expect(masivo.map((i) => i.id)).toContain(fuera);
    expect(individual.map((i) => i.id)).toContain(fuera);
  });

  it('el delegado solo ve lo de los controles que ejecuta', async () => {
    expect(controlsOf(itemsOf(await delegado.get(url(a.serviceId)).expect(200)))).toEqual([controlD]);
  });

  it('?view=technical: el administrador y el auditor lo piden; el responsable y el delegado reciben 403', async () => {
    const items = itemsOf(await a.agent.get(url(a.serviceId, '?view=technical')).expect(200));
    expect(items.every((i) => i.submissions.every((s) => 'technical' in (s as object)))).toBe(true);
    await auditor.get(url(a.serviceId, '?view=technical')).expect(200);
    await responsable.get(url(a.serviceId, '?view=technical')).expect(403);
    await delegado.get(url(a.serviceId, '?view=technical')).expect(403);
  });

  it('un servicio de otra empresa o inexistente es 404', async () => {
    await b.agent.get(url(a.serviceId)).expect(404);
    await a.agent.get(url(b.serviceId)).expect(404);
    await a.agent.get(url('00000000-0000-4000-8000-000000000000')).expect(404);
    await a.agent.get(url('no-es-uuid')).expect(404);
  });

  it('sin sesión es 401', async () => {
    await (await import('supertest')).default(app.getHttpServer()).get(url(a.serviceId)).expect(401);
  });
});
