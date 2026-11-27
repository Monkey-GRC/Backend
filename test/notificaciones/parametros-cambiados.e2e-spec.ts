import type { INestApplication } from '@nestjs/common';
import { Agent, bootApp, owner, RUN } from '../support/app';
import { idDe } from '../support/avisos';
import { invitarYActivar, sembrarEquipo } from '../support/equipo';
import { asApp, failure, withRollback } from '../support/db';
import { dosEmpresas, Tenant } from '../support/escenario';
import { RollEvaluationPeriodsUseCase } from '../../src/features/compliance/application/periods/evaluation-period.use-cases';

// MD-508 · D153 · `check_parameters_changed`: Monkey cambia un parámetro (PATCH, que deja el cambio en el historial del catálogo) y la pasada por empresa avisa a cada admin_empresa activo, con el
// permiso de esa empresa y sin ningún privilegio entre empresas. No es instantáneo.
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let adminA: string;
let adminB: string;
let segundoAdminA: { id: string; session: Agent };
let responsable: { id: string; session: Agent };
let delegado: { id: string; session: Agent };
let n = 0;
const email = (k: string) => `${k}-${RUN}-${n++}@parametros-cambiados.test`;
const KEY = 'approval_max_steps'; // PR-11: no mueve el motor técnico ni las pruebas que corren en paralelo
const pasada = (now: Date = new Date()) => app.get(RollEvaluationPeriodsUseCase).execute(now, [a.companyId, b.companyId]);
const cambiar = (value: number) => monkey.patch(`/v1/catalog/evaluation-parameters/${KEY}`).send({ value }).expect(200);
const avisos = (companyId: string) =>
  owner<{ user_id: string; target_id: string; target_kind: string; dedupe_key: string; params: any }>(
    `select user_id, target_id, target_kind::text, dedupe_key, params from platform.notifications where company_id = $1 and type = 'check_parameters_changed' order by dedupe_key, user_id`,
    [companyId],
  );
const restaurar = async () => {
  await owner('update catalog.evaluation_parameters set value = default_value, updated_at = null, updated_by = null');
  await owner('delete from catalog.evaluation_parameter_changes');
  await owner('delete from platform.notifications where company_id = any($1::uuid[])', [[a.companyId, b.companyId]]);
  await owner(`update platform.companies set created_at = now() - interval '30 days' where id = any($1::uuid[])`, [[a.companyId, b.companyId]]);
};

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  adminA = await idDe(a.email);
  adminB = await idDe(b.email);
  segundoAdminA = await invitarYActivar(app, a.agent, { email: email('adm'), name: 'Segunda', last_name: 'Admin', role: 'admin_empresa' });
  responsable = await invitarYActivar(app, a.agent, { email: email('resp'), name: 'Laura', last_name: 'Gómez', role: 'responsable' });
  const equipo = await sembrarEquipo(a.companyId, responsable.id, `Equipo ${RUN}`);
  delegado = await invitarYActivar(app, a.agent, { email: email('del'), name: 'Juan', last_name: 'Pérez', role: 'delegado', group_id: equipo, is_internal: true });
});
afterAll(async () => {
  await restaurar();
  await app?.close();
});
beforeEach(restaurar);

describe('check_parameters_changed · el PATCH deja el historial y la pasada por empresa avisa (D153)', () => {
  it('el PATCH guarda el cambio (valor anterior y nuevo) en el historial del catálogo, en su transacción, y todavía no avisa a nadie', async () => {
    const res = await cambiar(4);
    const rows = await owner<{ parameter_key: string; code: string; previous_value: unknown; new_value: unknown; changed_by: string }>('select parameter_key, code, previous_value, new_value, changed_by from catalog.evaluation_parameter_changes');
    expect(rows).toEqual([{ parameter_key: KEY, code: 'PR-11', previous_value: 5, new_value: 4, changed_by: res.body.data.updated_by.id }]);
    expect(await avisos(a.companyId)).toEqual([]);
  });

  it('el mismo valor no deja historial', async () => {
    await cambiar(5);
    expect(await owner('select 1 from catalog.evaluation_parameter_changes')).toEqual([]);
  });

  it('en la siguiente pasada avisa a cada admin_empresa activo de cada empresa, con el aviso de tipo empresa y la clave del cambio', async () => {
    await cambiar(4);
    const [{ id }] = await owner<{ id: string }>('select id from catalog.evaluation_parameter_changes');
    await pasada();
    const deA = await avisos(a.companyId);
    expect(deA.map((r) => r.user_id).sort()).toEqual([adminA, segundoAdminA.id].sort());
    expect(deA[0]).toMatchObject({ target_kind: 'company', target_id: a.companyId, dedupe_key: `check_parameters_changed:${id}`, params: { parameter_key: KEY, parameter_code: 'PR-11', previous_value: 5, new_value: 4 } });
    expect((await avisos(b.companyId)).map((r) => r.user_id)).toEqual([adminB]);
  });

  it('no avisa al responsable, al delegado ni al auditor', async () => {
    await cambiar(4);
    await pasada();
    const quienes = (await avisos(a.companyId)).map((r) => r.user_id);
    expect(quienes).not.toContain(responsable.id);
    expect(quienes).not.toContain(delegado.id);
    expect(((await responsable.session.get('/v1/me/notifications?type=check_parameters_changed').expect(200)).body.data.items as any[]).length).toBe(0);
    expect(((await delegado.session.get('/v1/me/notifications?type=check_parameters_changed').expect(200)).body.data.items as any[]).length).toBe(0);
  });

  it('es idempotente: repetir la pasada, o hacer otro cambio después, no duplica lo ya avisado', async () => {
    await cambiar(4);
    await pasada();
    await pasada();
    expect((await avisos(a.companyId)).length).toBe(2);
    await cambiar(3);
    await pasada();
    expect((await avisos(a.companyId)).length).toBe(4);
    expect(new Set((await avisos(a.companyId)).map((r) => r.dedupe_key)).size).toBe(2);
  });

  it('una empresa creada después del cambio no lo recibe', async () => {
    await cambiar(4);
    await owner(`update platform.companies set created_at = now() + interval '1 hour' where id = $1`, [b.companyId]);
    await pasada();
    expect(await avisos(b.companyId)).toEqual([]);
    expect((await avisos(a.companyId)).length).toBe(2);
  });

  it('lo ve el administrador en su campana: título con el parámetro y su PR-n, valores y efecto, sin servicio ni control, sin proveedor', async () => {
    await cambiar(4);
    await pasada();
    const items = (await a.agent.get('/v1/me/notifications?type=check_parameters_changed').expect(200)).body.data.items as any[];
    expect(items).toHaveLength(1);
    const item = items[0];
    expect(item.title).toBe('Cambió un parámetro de evaluación: Pasos máximos de aprobación (PR-11)');
    expect(item).toMatchObject({ control: null, service: null, target: { kind: 'company', id: a.companyId, service_id: null } });
    expect(item.detail.what_happened).toContain('el valor anterior era 5 y el nuevo es 4');
    for (const campo of ['what_happened', 'why_it_matters', 'how_to_fix', 'who', 'time_needed', 'evidence', 'impact']) expect(typeof item.detail[campo]).toBe('string');
    expect(JSON.stringify(item)).not.toMatch(/wazuh|prowler/i);
  });

  it('aislamiento (SEG-87): el administrador de B no ve el aviso de A ni el de otra persona', async () => {
    await cambiar(4);
    await pasada();
    const deB = (await b.agent.get('/v1/me/notifications?type=check_parameters_changed').expect(200)).body.data.items as any[];
    expect(deB).toHaveLength(1);
    expect(deB[0].target.id).toBe(b.companyId);
    expect(((await segundoAdminA.session.get('/v1/me/notifications?type=check_parameters_changed').expect(200)).body.data.items as any[]).every((i) => i.target.id === a.companyId)).toBe(true);
  });

  it('admin_monkey no recibe el aviso', async () => {
    await cambiar(4);
    await pasada();
    const todos = await owner<{ user_id: string }>(`select n.user_id from platform.notifications n join platform.users u on u.id = n.user_id where n.type = 'check_parameters_changed' and u.role = 'admin_monkey'`);
    expect(todos).toEqual([]);
  });
});

// MD-508 · El historial es inmutable para la app: ni `admin_monkey` lo actualiza, borra ni vacía, y una sesión de empresa no escribe en él (D31). Con el rol real de la app (monkey_app), no con el dueño.
describe('catalog.evaluation_parameter_changes · inmutable con el rol de la app', () => {
  const insertar = `insert into catalog.evaluation_parameter_changes (id, parameter_key, code, previous_value, new_value) values (gen_random_uuid(), 'approval_max_steps', 'PR-11', '5', '4')`;

  it('admin_monkey puede insertar y leer, pero UPDATE, DELETE y TRUNCATE son «permission denied»', () =>
    withRollback(async (db) => {
      await asApp(db, { role: 'admin_monkey' }, async () => {
        await db.query(insertar);
        expect((await db.query('select 1 from catalog.evaluation_parameter_changes')).rowCount).toBe(1);
        expect(await failure(db, `update catalog.evaluation_parameter_changes set new_value = '9'`)).toMatch(/permission denied/i);
        expect(await failure(db, 'delete from catalog.evaluation_parameter_changes')).toMatch(/permission denied/i);
        expect(await failure(db, 'truncate catalog.evaluation_parameter_changes')).toMatch(/permission denied/i);
      });
    }));

  it('una sesión de empresa lee el historial pero no puede escribir en él', () =>
    withRollback(async (db) => {
      await db.query(insertar);
      await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, async () => {
        expect((await db.query('select 1 from catalog.evaluation_parameter_changes')).rowCount).toBe(1);
        expect(await failure(db, insertar)).toMatch(/row-level security/i);
        expect(await failure(db, `update catalog.evaluation_parameter_changes set new_value = '9'`)).toMatch(/permission denied/i);
      });
    }));
});
