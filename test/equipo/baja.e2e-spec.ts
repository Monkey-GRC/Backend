import type { INestApplication } from '@nestjs/common';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { FileStorage } from '../../src/common/storage/file-storage';
import { Agent, bootApp, login, owner, RUN } from '../support/app';
import { asignarControl, controlesDe } from '../support/asignaciones';
import { invitarYActivar, sembrarEquipo } from '../support/equipo';
import { conPg as pg, esperarBloqueados } from '../support/bloqueos';
import { dosEmpresas, empresaConCupo, Tenant } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-191 · SEG-74 · La baja con aviso y la reactivación (contracts/gestion-usuarios.md · PATCH /v1/users/{id}): por HTTP real contra el Postgres desechable, con el rol de la app (RLS).
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let adminId: string;
let controles: string[];
let rA: { id: string; session: Agent }; // responsable con equipo (dueño de los controles de los delegados)
let teamA: string;
const realInsert = auditInsert.insertAuditLog;
let n = 0;
const email = (k: string) => `${k}-${RUN}-${n++}@baja.test`;
const fields = (res: { body: any }) => (res.body.error.fields as Array<{ field: string; code: string }>).map(({ field, code }) => ({ field, code }));
const patch = (id: string, body: object, agent: Agent = a.agent) => agent.patch(`/v1/users/${id}`).send(body);

type Rol = 'admin_empresa' | 'responsable' | 'delegado' | 'auditor';
const activo = (role: Rol, group?: string, agent: Agent = a.agent) =>
  invitarYActivar(app, agent, { email: email(role), name: 'Persona', last_name: 'De Prueba', role, ...(role === 'delegado' ? { group_id: group, is_internal: true } : {}) });
/** Un responsable activo con su equipo ya creado. */
const responsableConEquipo = async () => {
  const r = await activo('responsable');
  return { ...r, team: await sembrarEquipo(a.companyId, r.id, `Equipo ${RUN} ${n++}`) };
};
const fila = (id: string) => owner<{ status: string; group_id: string | null; is_internal: boolean | null }>('select status::text, group_id, is_internal from platform.users where id = $1', [id]).then((r) => r[0]);
const asignacion = (controlId: string) =>
  owner<{ owner_id: string; executor_id: string | null }>('select owner_id, executor_id from platform.client_control_assignments where client_control_id = $1', [controlId]).then((r) => r[0] ?? null);
const sesionesVivas = (id: string) => owner<{ n: number }>('select count(*)::int n from platform.sessions where user_id = $1 and revoked_at is null', [id]).then((r) => r[0].n);
const rastrosDe = (action: string, userId: string) =>
  owner<{ user_id: string; tenant_id: string; resource: string; before_state: any; after_state: any }>(
    `select user_id, tenant_id, resource, before_state, after_state from audit.audit_logs where tenant_id = $1 and action = $2
      and (after_state->>'id' = $3 or before_state->>'owner_id' = $3 or before_state->>'executor_id' = $3) order by after_state->>'client_control_id', created_at`,
    [a.companyId, action, userId],
  );
const nRastros = () => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1', [a.companyId]).then((r) => r[0].n);

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(new StorageEnMemoria()));
  ({ a, b, monkey } = await dosEmpresas(app));
  adminId = (await owner<{ id: string }>('select id from platform.users where email = $1', [a.email]))[0].id;
  controles = await controlesDe(a.serviceId);
  expect(controles.length).toBeGreaterThanOrEqual(8);
  ({ team: teamA, ...rA } = await responsableConEquipo());
});
afterAll(async () => {
  await app?.close();
});
beforeEach(async () => {
  await owner('delete from platform.client_control_assignments where company_id = $1', [a.companyId]);
});
afterEach(() => jest.restoreAllMocks());

describe('Baja sin controles', () => {
  it('200: queda inactive, cierra todas sus sesiones, no la deja entrar y el rastro cuenta las sesiones; no hay entradas por control', async () => {
    const p = await activo('auditor');
    await p.session.get('/v1/auth/me').expect(200);
    expect(await sesionesVivas(p.id)).toBeGreaterThan(0);
    const res = await patch(p.id, { status: 'inactive' }).expect(200);
    expect(res.body.data).toMatchObject({ id: p.id, status: 'inactive' });
    expect(await sesionesVivas(p.id)).toBe(0);
    await p.session.get('/v1/auth/me').expect(401);
    const [u] = await rastrosDe('user.update', p.id);
    expect(u).toMatchObject({ user_id: adminId, tenant_id: a.companyId, resource: 'user', before_state: { status: 'active' }, after_state: { status: 'inactive', sessions_closed: expect.any(Number) } });
    expect(u.after_state).not.toHaveProperty('controls_unassigned');
    expect(await rastrosDe('control_assignment.set', p.id)).toHaveLength(0);
  });

  it('libera el cupo: con el cupo lleno no entra nadie; tras la baja, sí', async () => {
    const e = await empresaConCupo(app, monkey, 'BajaCupo', 2);
    const p = await invitarYActivar(app, e.agent, { email: email('cupo'), name: 'P', last_name: 'P', role: 'auditor' });
    const otro = { email: email('cupo-otro'), name: 'P', last_name: 'P', role: 'auditor' };
    await e.agent.post('/v1/users').send(otro).expect(409);
    await e.agent.patch(`/v1/users/${p.id}`).send({ status: 'inactive' }).expect(200);
    await e.agent.post('/v1/users').send(otro).expect(201);
  });
});

describe('Baja de quien tiene controles', () => {
  const casos: Array<{ rol: Rol; fixture: () => Promise<{ id: string; session: Agent; propios: string[]; ejecuta: boolean }> }> = [
    {
      rol: 'delegado',
      fixture: async () => {
        const d = await activo('delegado', teamA);
        const propios = controles.slice(0, 3);
        for (const c of propios) await asignarControl(a.companyId, c, rA.id, d.id);
        return { ...d, propios, ejecuta: true };
      },
    },
    {
      rol: 'responsable',
      fixture: async () => {
        const r = await activo('responsable');
        const propios = controles.slice(0, 3);
        for (const c of propios) await asignarControl(a.companyId, c, r.id);
        return { ...r, propios, ejecuta: false };
      },
    },
    {
      rol: 'admin_empresa',
      fixture: async () => {
        const r = await activo('admin_empresa');
        const propios = controles.slice(0, 3);
        for (const c of propios) await asignarControl(a.companyId, c, r.id);
        return { ...r, propios, ejecuta: false };
      },
    },
  ];

  for (const { rol, fixture } of casos) {
    it(`${rol}: sin confirmar, 409 USER_HAS_ASSIGNMENTS con controls_count y no cambia nada (ni sesiones, ni asignaciones, ni rastro)`, async () => {
      const p = await fixture();
      const otro = controles[3];
      await asignarControl(a.companyId, otro, rA.id); // un control ajeno no cuenta
      const antes = await nRastros();
      for (const body of [{ status: 'inactive' }, { status: 'inactive', confirm_unassign: false }]) {
        const res = await patch(p.id, body).expect(409);
        expect(res.body.error).toMatchObject({ code: 'USER_HAS_ASSIGNMENTS', controls_count: 3 });
      }
      expect((await fila(p.id)).status).toBe('active');
      expect(await sesionesVivas(p.id)).toBeGreaterThan(0);
      await p.session.get('/v1/auth/me').expect(200);
      for (const c of p.propios) expect(await asignacion(c)).toMatchObject(p.ejecuta ? { owner_id: rA.id, executor_id: p.id } : { owner_id: p.id, executor_id: null });
      expect(await nRastros()).toBe(antes);
    });

    it(`${rol}: con confirm_unassign se desactiva en una transacción, ${rol === 'delegado' ? 'sus controles siguen con su dueño sin ejecutor' : 'sus controles quedan «Sin asignar»'}, y deja user.update y una control_assignment.set por control`, async () => {
      const p = await fixture();
      await asignarControl(a.companyId, controles[3], rA.id); // ajeno: no se toca
      const res = await patch(p.id, { status: 'inactive', confirm_unassign: true }).expect(200);
      expect(res.body.data.status).toBe('inactive');
      await p.session.get('/v1/auth/me').expect(401);
      for (const c of p.propios) expect(await asignacion(c)).toEqual(p.ejecuta ? { owner_id: rA.id, executor_id: null } : null);
      expect(await asignacion(controles[3])).toEqual({ owner_id: rA.id, executor_id: null });

      const [u] = await rastrosDe('user.update', p.id);
      expect(u.after_state).toMatchObject({ status: 'inactive', controls_unassigned: 3, sessions_closed: expect.any(Number) });
      const porControl = await rastrosDe('control_assignment.set', p.id);
      expect(porControl).toHaveLength(3);
      expect(porControl.map((r) => r.after_state.client_control_id).sort()).toEqual([...p.propios].sort());
      for (const r of porControl) {
        expect(r).toMatchObject({ user_id: adminId, tenant_id: a.companyId, resource: 'control_assignment' });
        expect(r.before_state).toEqual(
          p.ejecuta ? { client_control_id: r.after_state.client_control_id, owner_id: rA.id, executor_id: p.id } : { client_control_id: r.after_state.client_control_id, owner_id: p.id, executor_id: null },
        );
        expect(r.after_state).toEqual({ client_control_id: r.after_state.client_control_id, owner_id: p.ejecuta ? rA.id : null, executor_id: null });
      }
    });
  }

  it('el conteo es de controles distintos y el auditor, que no tiene asignaciones, se desactiva sin confirmar', async () => {
    const d = await activo('delegado', teamA);
    for (const c of controles.slice(0, 5)) await asignarControl(a.companyId, c, rA.id, d.id);
    expect((await patch(d.id, { status: 'inactive' }).expect(409)).body.error.controls_count).toBe(5);
    const aud = await activo('auditor');
    await patch(aud.id, { status: 'inactive' }).expect(200);
  });

  it('cientos de controles: una entrada por control, en lote y en la misma transacción', async () => {
    const d = await activo('delegado', teamA);
    for (const c of controles) await asignarControl(a.companyId, c, rA.id, d.id);
    await patch(d.id, { status: 'inactive', confirm_unassign: true }).expect(200);
    expect(await rastrosDe('control_assignment.set', d.id)).toHaveLength(controles.length);
    expect(await rastrosDe('user.update', d.id)).toHaveLength(1);
    expect((await rastrosDe('user.update', d.id))[0].after_state.controls_unassigned).toBe(controles.length);
  });

  it('el historial se conserva: la fila de la persona y su auditoría siguen, ninguna FK hacia platform.users borra en cascada', async () => {
    const d = await activo('delegado', teamA);
    await asignarControl(a.companyId, controles[0], rA.id, d.id);
    const trazas = () => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where user_id = $1', [d.id]).then((r) => r[0].n);
    const antes = await trazas();
    expect(antes).toBeGreaterThan(0); // su activación
    await patch(d.id, { status: 'inactive', confirm_unassign: true }).expect(200);
    expect(await trazas()).toBe(antes);
    expect(await fila(d.id)).toBeDefined();
    const cascadas = await owner<{ tabla: string; col: string }>(
      `select c.conrelid::regclass::text tabla, a.attname col from pg_constraint c join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
        where c.contype = 'f' and c.confdeltype = 'c' and c.confrelid in ('platform.users'::regclass, 'platform.user_groups'::regclass)`,
    );
    expect(cascadas).toEqual([]);
  });
});

describe('Responsable con delegados', () => {
  it('409 RESPONSIBLE_HAS_DELEGATES con delegates_count (activos y pendientes), también con confirmación y antes de USER_HAS_ASSIGNMENTS; luego sí, al moverlos o desactivarlos', async () => {
    const r = await responsableConEquipo();
    const d1 = await activo('delegado', r.team);
    const d2 = (await a.agent.post('/v1/users').send({ email: email('pend'), name: 'P', last_name: 'P', role: 'delegado', group_id: r.team, is_internal: false }).expect(201)).body.data;
    const inactivo = await activo('delegado', r.team);
    await patch(inactivo.id, { status: 'inactive' }).expect(200); // los inactivos no cuentan
    await asignarControl(a.companyId, controles[0], r.id, d1.id);

    for (const body of [{ status: 'inactive' }, { status: 'inactive', confirm_unassign: true }]) {
      const res = await patch(r.id, body).expect(409);
      expect(res.body.error).toMatchObject({ code: 'RESPONSIBLE_HAS_DELEGATES', delegates_count: 2 });
    }
    expect((await fila(r.id)).status).toBe('active');
    expect(await sesionesVivas(r.id)).toBeGreaterThan(0);
    expect(await asignacion(controles[0])).toEqual({ owner_id: r.id, executor_id: d1.id });

    await patch(d1.id, { status: 'inactive', confirm_unassign: true }).expect(200);
    expect((await patch(r.id, { status: 'inactive', confirm_unassign: true }).expect(409)).body.error.delegates_count).toBe(1);
    await patch(d2.id, { group_id: teamA }).expect(200); // el pendiente se mueve a otro equipo
    // Ya sin delegados vigentes: sus controles propios piden confirmación, y con ella quedan «Sin asignar».
    expect((await patch(r.id, { status: 'inactive' }).expect(409)).body.error).toMatchObject({ code: 'USER_HAS_ASSIGNMENTS', controls_count: 1 });
    await patch(r.id, { status: 'inactive', confirm_unassign: true }).expect(200);
    expect(await asignacion(controles[0])).toBeNull();
    // El equipo no se borra: queda con el líder inactivo, y al reactivar al responsable vuelve a liderarlo.
    expect(await owner('select 1 from platform.user_groups where id = $1 and leader_id = $2', [r.team, r.id])).toHaveLength(1);
    await patch(r.id, { status: 'active' }).expect(200);
    expect(await owner('select 1 from platform.user_groups where id = $1 and leader_id = $2', [r.team, r.id])).toHaveLength(1);
  });
});

describe('Orden de comprobaciones', () => {
  it('uno mismo es LAST_ADMIN aunque tenga controles; una cuenta pending es USER_NOT_ACTIVATED; y 404 antes que todo', async () => {
    await asignarControl(a.companyId, controles[0], adminId);
    expect((await patch(adminId, { status: 'inactive' }).expect(409)).body.error.code).toBe('LAST_ADMIN');
    expect(await asignacion(controles[0])).toEqual({ owner_id: adminId, executor_id: null });
    const pend = (await a.agent.post('/v1/users').send({ email: email('pend'), name: 'P', last_name: 'P', role: 'responsable' }).expect(201)).body.data.id;
    await asignarControl(a.companyId, controles[1], pend);
    expect((await patch(pend, { status: 'inactive', confirm_unassign: true }).expect(409)).body.error.code).toBe('USER_NOT_ACTIVATED');
    expect((await patch(pend, { status: 'active' }).expect(409)).body.error.code).toBe('USER_NOT_ACTIVATED');
    expect(await asignacion(controles[1])).toEqual({ owner_id: pend, executor_id: null });
  });

  it('otra empresa, admin_monkey o un id que no existe: 404, y no cambia nada aunque se mande confirmación', async () => {
    const ajena = await invitarYActivar(app, b.agent, { email: email('ajena'), name: 'P', last_name: 'P', role: 'auditor' });
    const [m] = await owner<{ id: string }>(`select id from platform.users where role = 'admin_monkey' limit 1`);
    for (const id of [ajena.id, m.id, '00000000-0000-0000-0000-000000000000']) {
      expect((await patch(id, { status: 'inactive', confirm_unassign: true }).expect(404)).body.error.code).toBe('NOT_FOUND');
    }
    expect((await fila(ajena.id)).status).toBe('active');
    expect(await sesionesVivas(ajena.id)).toBeGreaterThan(0);
  });
});

describe('Atomicidad', () => {
  it('si el rastro falla, no cambia nada: ni el estado, ni las sesiones, ni las asignaciones, ni las entradas por control', async () => {
    const d = await activo('delegado', teamA);
    await asignarControl(a.companyId, controles[0], rA.id, d.id);
    const antes = await nRastros();
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    await patch(d.id, { status: 'inactive', confirm_unassign: true }).expect(500);
    expect((await fila(d.id)).status).toBe('active');
    expect(await sesionesVivas(d.id)).toBeGreaterThan(0);
    expect(await asignacion(controles[0])).toEqual({ owner_id: rA.id, executor_id: d.id });
    expect(await nRastros()).toBe(antes);
  });
});

describe('Mover a un delegado (MD-189) deja una entrada por control', () => {
  it('con confirmación: user.update con controls_unassigned y una control_assignment.set por control con dueño y ejecutor antes y después', async () => {
    const r2 = await responsableConEquipo();
    const d = await activo('delegado', teamA);
    for (const c of controles.slice(0, 4)) await asignarControl(a.companyId, c, rA.id, d.id);
    await patch(d.id, { group_id: r2.team, confirm_unassign: true }).expect(200);
    const [u] = await rastrosDe('user.update', d.id);
    expect(u.after_state).toMatchObject({ group_id: r2.team, controls_unassigned: 4 });
    const porControl = await rastrosDe('control_assignment.set', d.id);
    expect(porControl).toHaveLength(4);
    for (const r of porControl) {
      expect(r.before_state).toMatchObject({ owner_id: rA.id, executor_id: d.id });
      expect(r.after_state).toMatchObject({ owner_id: rA.id, executor_id: null });
      expect(controles.slice(0, 4)).toContain(r.after_state.client_control_id);
    }
  });

  it('sin controles, o mandando el mismo equipo, no hay entradas por control', async () => {
    const d = await activo('delegado', teamA);
    const r2 = await responsableConEquipo();
    await patch(d.id, { group_id: teamA, confirm_unassign: true }).expect(200);
    await patch(d.id, { group_id: r2.team }).expect(200);
    expect(await rastrosDe('control_assignment.set', d.id)).toHaveLength(0);
  });

  it('mover y desactivar en la misma petición cuenta los controles una sola vez', async () => {
    const r2 = await responsableConEquipo();
    const d = await activo('delegado', teamA);
    for (const c of controles.slice(0, 2)) await asignarControl(a.companyId, c, rA.id, d.id);
    await patch(d.id, { group_id: r2.team, status: 'inactive', confirm_unassign: true }).expect(200);
    expect((await rastrosDe('user.update', d.id))[0].after_state).toMatchObject({ status: 'inactive', group_id: r2.team, controls_unassigned: 2 });
    expect(await rastrosDe('control_assignment.set', d.id)).toHaveLength(2);
  });
});

describe('Reactivar', () => {
  it('vuelve a comprobar el cupo (409 USER_LIMIT_REACHED y sigue inactive); con lugar, devuelve el acceso pero no las asignaciones', async () => {
    const e = await empresaConCupo(app, monkey, 'ReactivaCupo', 3);
    const r = await invitarYActivar(app, e.agent, { email: email('rc'), name: 'P', last_name: 'P', role: 'responsable' });
    await e.agent.patch(`/v1/users/${r.id}`).send({ status: 'inactive' }).expect(200);
    const lleno = await invitarYActivar(app, e.agent, { email: email('rc-lleno'), name: 'P', last_name: 'P', role: 'auditor' });
    const otro = await invitarYActivar(app, e.agent, { email: email('rc-otro'), name: 'P', last_name: 'P', role: 'auditor' });
    const res = await e.agent.patch(`/v1/users/${r.id}`).send({ status: 'active' }).expect(409);
    expect(res.body.error).toMatchObject({ code: 'USER_LIMIT_REACHED', max_users: 3 });
    expect((await fila(r.id)).status).toBe('inactive');
    await e.agent.patch(`/v1/users/${otro.id}`).send({ status: 'inactive' }).expect(200);
    await e.agent.patch(`/v1/users/${r.id}`).send({ status: 'active' }).expect(200);
    await login(app, r.data.email);
    expect(lleno.id).toBeDefined();
  });

  it('un responsable reactivado no recupera sus controles: siguen «Sin asignar»; sin entradas nuevas por control', async () => {
    const r = await activo('responsable');
    await asignarControl(a.companyId, controles[0], r.id);
    await patch(r.id, { status: 'inactive', confirm_unassign: true }).expect(200);
    const antes = (await rastrosDe('control_assignment.set', r.id)).length;
    await patch(r.id, { status: 'active', confirm_unassign: true }).expect(200);
    expect(await asignacion(controles[0])).toBeNull();
    expect(await sesionesVivas(r.id)).toBe(0); // las sesiones cerradas no reviven
    expect((await rastrosDe('control_assignment.set', r.id)).length).toBe(antes);
    await login(app, (await owner<{ email: string }>('select email from platform.users where id = $1', [r.id]))[0].email);
  });

  it('un delegado cuyo responsable está inactivo: 409 TEAM_LEADER_INACTIVE y sigue inactive; tras moverlo a otro equipo, sí', async () => {
    const r = await responsableConEquipo();
    const d = await activo('delegado', r.team);
    await patch(d.id, { status: 'inactive' }).expect(200);
    await patch(r.id, { status: 'inactive' }).expect(200); // ya sin delegados vigentes
    const res = await patch(d.id, { status: 'active' }).expect(409);
    expect(res.body.error.code).toBe('TEAM_LEADER_INACTIVE');
    expect(res.body.message).toContain('responsable');
    expect((await fila(d.id)).status).toBe('inactive');
    // Moverlo (inactivo) a un equipo con líder vigente se permite; entonces se reactiva.
    await patch(d.id, { group_id: teamA }).expect(200);
    await patch(d.id, { status: 'active' }).expect(200);
    // Con el responsable pendiente o reactivado también se puede.
    const d2 = await activo('delegado', teamA);
    await patch(d2.id, { status: 'inactive' }).expect(200);
    await patch(d2.id, { status: 'active' }).expect(200);
  });

  it('mover y reactivar a la vez: lo que importa es el responsable del destino; un destino no vigente es 404', async () => {
    const r = await responsableConEquipo();
    const d = await activo('delegado', r.team);
    await patch(d.id, { status: 'inactive' }).expect(200);
    await patch(r.id, { status: 'inactive' }).expect(200);
    await patch(d.id, { status: 'active', group_id: r.team }).expect(404);
    expect((await fila(d.id)).status).toBe('inactive');
    await patch(d.id, { status: 'active', group_id: teamA }).expect(200);
    expect(await fila(d.id)).toMatchObject({ status: 'active', group_id: teamA });
  });

  it('reactivar a quien no es delegado no mira ningún responsable; y reactivar a quien ya está activo no cambia nada', async () => {
    const aud = await activo('auditor');
    await patch(aud.id, { status: 'inactive' }).expect(200);
    await patch(aud.id, { status: 'active' }).expect(200);
    const antes = await nRastros();
    await patch(aud.id, { status: 'active' }).expect(200);
    expect(await nRastros()).toBe(antes);
  });
});

describe('is_internal', () => {
  it('un delegado lo corrige (solo, o junto con otros campos) y queda en el rastro; los demás roles reciben 422 is_internal.not_allowed', async () => {
    const d = await activo('delegado', teamA);
    const res = await patch(d.id, { is_internal: false }).expect(200);
    expect(res.body.data.is_internal).toBe(false);
    expect((await fila(d.id)).is_internal).toBe(false);
    const res2 = await patch(d.id, { is_internal: true, name: 'Nuevo' }).expect(200);
    expect(res2.body.data).toMatchObject({ is_internal: true, name: 'Nuevo' });
    const r = (await rastrosDe('user.update', d.id)).pop();
    expect(r).toMatchObject({ before_state: { is_internal: false }, after_state: { is_internal: true } });

    const otros = [await activo('responsable'), await activo('auditor'), await activo('admin_empresa')];
    for (const o of otros) {
      expect(fields(await patch(o.id, { is_internal: true }).expect(422))).toEqual([{ field: 'is_internal', code: 'is_internal.not_allowed' }]);
      expect(fields(await patch(o.id, { is_internal: false, name: 'X' }).expect(422))).toEqual([{ field: 'is_internal', code: 'is_internal.not_allowed' }]);
      expect((await fila(o.id)).is_internal).toBeNull();
    }
    expect(fields(await patch(d.id, { is_internal: 'si' }).expect(422))).toEqual([{ field: 'is_internal', code: 'boolean.invalid' }]);
  });
});

describe('confirm_unassign solo se evalúa al desactivar o mover', () => {
  it('con otros cambios no toca las asignaciones: ni al corregir el nombre, ni al reactivar', async () => {
    const d = await activo('delegado', teamA);
    await asignarControl(a.companyId, controles[0], rA.id, d.id);
    await patch(d.id, { name: 'Otro', is_internal: false, confirm_unassign: true }).expect(200);
    expect(await asignacion(controles[0])).toEqual({ owner_id: rA.id, executor_id: d.id });
    await patch(d.id, { status: 'active', confirm_unassign: true }).expect(200);
    expect(await asignacion(controles[0])).toEqual({ owner_id: rA.id, executor_id: d.id });
    expect(await rastrosDe('control_assignment.set', d.id)).toHaveLength(0);
  });
});

describe('Quién puede', () => {
  it('solo admin_empresa: sin sesión 401; responsable, delegado, auditor y admin_monkey, 403', async () => {
    const d = await activo('delegado', teamA);
    const aud = await activo('auditor');
    const objetivo = (await activo('auditor')).id;
    const request = (await import('supertest')).default;
    await request(app.getHttpServer()).patch(`/v1/users/${objetivo}`).send({ status: 'inactive' }).expect(401);
    for (const agente of [rA.session, d.session, aud.session, monkey]) await patch(objetivo, { status: 'inactive' }, agente).expect(403);
    expect((await fila(objetivo)).status).toBe('active');
  });
});

describe('Concurrencia · nunca un delegado vigente bajo un responsable inactivo (bloqueos: sujeto, luego líder, luego empresa)', () => {
  const vigentesBajo = (team: string) => owner<{ n: number }>(`select count(*)::int n from platform.users where group_id = $1 and role = 'delegado' and status in ('active', 'pending')`, [team]).then((r) => r[0].n);
  const invariante = async (r: { id: string; team: string }) => {
    const { status } = await fila(r.id);
    if (status === 'inactive') expect(await vigentesBajo(r.team)).toBe(0);
  };
  const crear = (team: string) => a.agent.post('/v1/users').send({ email: email('c'), name: 'P', last_name: 'P', role: 'delegado', group_id: team, is_internal: true });

  it('desactivar al responsable en curso (fila bloqueada): crear, mover y reactivar a un delegado en su equipo esperan y luego fallan, sin 201 ni 200', async () => {
    const r = await responsableConEquipo();
    const movible = await activo('delegado', teamA);
    const dormido = await activo('delegado', r.team);
    await patch(dormido.id, { status: 'inactive' }).expect(200);
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('select id from platform.users where id = $1 for update', [r.id]); // la baja del responsable, a medias
      const creando = crear(r.team).then((x) => x);
      const moviendo = patch(movible.id, { group_id: r.team }).then((x) => x);
      const reactivando = patch(dormido.id, { status: 'active' }).then((x) => x);
      const pendientes = [creando, moviendo, reactivando];
      expect(await esperarBloqueados(pid, 3, pendientes)).toBe(0);
      await c.query(`update platform.users set status = 'inactive' where id = $1`, [r.id]);
      await c.query('commit');
      expect((await creando).status).toBe(404);
      expect((await moviendo).status).toBe(404);
      const rr = await reactivando;
      expect(rr.status).toBe(409);
      expect(rr.body.error.code).toBe('TEAM_LEADER_INACTIVE');
    });
    expect(await vigentesBajo(r.team)).toBe(0);
    expect((await fila(movible.id)).group_id).toBe(teamA);
  });

  it('un delegado que entra (fila del responsable en FOR SHARE, aún sin confirmar): la baja del responsable espera, cuenta después y responde 409 RESPONSIBLE_HAS_DELEGATES', async () => {
    const r = await responsableConEquipo();
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('select id from platform.users where id = $1 for share', [r.id]);
      await c.query(
        `insert into platform.users (id, company_id, email, name, last_name, password_hash, role, status, group_id, is_internal) values (gen_random_uuid(), $1, $2, 'P', 'P', 'x', 'delegado', 'pending', $3, true)`,
        [a.companyId, email('entra'), r.team],
      );
      const baja = patch(r.id, { status: 'inactive' }).then((x) => x);
      expect(await esperarBloqueados(pid, 1, [baja])).toBe(0); // espera la fila del responsable
      await c.query('commit');
      const res = await baja;
      expect(res.status).toBe(409);
      expect(res.body.error).toMatchObject({ code: 'RESPONSIBLE_HAS_DELEGATES', delegates_count: 1 });
    });
    expect((await fila(r.id)).status).toBe('active');
    await invariante(r);
  });

  for (const escenario of ['crear', 'mover', 'reactivar'] as const) {
    it(`carrera repetida (${escenario} un delegado a la vez que se desactiva al responsable): sin 500, sin deadlock y con la invariante cumplida`, async () => {
      const r = await responsableConEquipo();
      const mudo = await activo('delegado', teamA);
      const resultados: string[] = [];
      for (let i = 0; i < 12; i++) {
        // Estado de partida de la ronda.
        await owner(`update platform.users set status = 'inactive' where group_id = $1 and role = 'delegado'`, [r.team]);
        await owner(`update platform.users set status = 'active' where id = $1`, [r.id]);
        if (escenario === 'reactivar') await owner(`update platform.users set status = 'inactive', group_id = $2 where id = $1`, [mudo.id, r.team]);
        else await owner(`update platform.users set status = 'active', group_id = $2 where id = $1`, [mudo.id, teamA]);
        const baja = patch(r.id, { status: 'inactive' });
        const otra = escenario === 'crear' ? crear(r.team) : escenario === 'mover' ? patch(mudo.id, { group_id: r.team }) : patch(mudo.id, { status: 'active' });
        const [x, y] = await Promise.all([baja, otra]);
        resultados.push(`${x.status}/${y.status}`);
        expect([200, 409]).toContain(x.status);
        expect([200, 201, 404, 409]).toContain(y.status);
        if (x.status === 200) expect(y.status === 200 || y.status === 201 ? 'viola' : 'ok').toBe('ok');
        else expect(x.body.error.code).toBe('RESPONSIBLE_HAS_DELEGATES');
        await invariante(r);
      }
      expect(resultados.length).toBe(12);
    });
  }
});

describe('Bloqueo del actor (orden global: actor y sujeto por id, líder, empresa) · sin deadlock entre administradores', () => {
  type Admin = { id: string; session: Agent };
  let e: { agent: Agent; companyId: string; email: string };
  let adminsDe: Admin[];
  const uno = (p: Promise<{ status: number; body: any }>) => p;
  const nuevaEmpresa = async (k: string, extra: number) => {
    const emp = await empresaConCupo(app, monkey, k, 1000);
    const admins: Admin[] = [];
    for (let i = 0; i < extra; i++) admins.push(await invitarYActivar(app, emp.agent, { email: email('adm'), name: 'Admin', last_name: 'De Prueba', role: 'admin_empresa' }));
    return { emp, admins };
  };
  /** Deja a esos administradores en el estado dado y sus sesiones vivas (la baja las revoca). */
  const poner = async (ids: string[], status: 'active' | 'inactive') => {
    await owner(`update platform.users set status = $2::platform.user_status where id = any($1::uuid[])`, [ids, status]);
    await owner('update platform.sessions set revoked_at = null where user_id = any($1::uuid[])', [ids]);
  };
  const activos = (companyId: string) => owner<{ n: number }>(`select count(*)::int n from platform.users where company_id = $1 and role = 'admin_empresa' and status = 'active'`, [companyId]).then((r) => r[0].n);
  const baja = (agent: Agent, id: string) => agent.patch(`/v1/users/${id}`).send({ status: 'inactive' });

  beforeAll(async () => {
    const { emp, admins } = await nuevaEmpresa('Locks', 3);
    e = emp;
    adminsDe = admins;
  });

  it('con la fila del actor bloqueada (su baja en curso), crear, reemitir, crear/renombrar grupo y desactivar a otro esperan y luego fallan con ACCOUNT_INACTIVE sin escribir nada', async () => {
    const [a1, a2, a3] = adminsDe;
    const grupo = (await e.agent.post('/v1/groups').send({ name: `Base ${RUN} ${n++}` }).expect(201)).body.data.id;
    const pendiente = (await e.agent.post('/v1/users').send({ email: email('pend'), name: 'P', last_name: 'P', role: 'auditor' }).expect(201)).body.data.id;
    const correo = email('nuevo');
    const nombreNuevo = `Nuevo ${RUN} ${n++}`;
    const filas = () => owner<{ n: number }>('select (select count(*) from platform.users where company_id = $1) + (select count(*) from platform.user_groups where company_id = $1) n', [e.companyId]).then((r) => Number(r[0].n));
    const antes = await filas();
    const rastrosAntes = await owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1', [e.companyId]).then((r) => r[0].n);
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('select id from platform.users where id = $1 for update', [a1.id]); // la baja de a1, a medias
      const pedidos = [
        a1.session.post('/v1/users').send({ email: correo, name: 'N', last_name: 'N', role: 'auditor' }),
        a1.session.post(`/v1/users/${pendiente}/activation-code`).send(),
        a1.session.post('/v1/groups').send({ name: nombreNuevo }),
        a1.session.patch(`/v1/groups/${grupo}`).send({ name: `Renombrado ${RUN} ${n++}` }),
        baja(a1.session, a2.id),
        a1.session.patch(`/v1/users/${a3.id}`).send({ name: 'Otro' }),
      ].map((p) => uno(p as never));
      expect(await esperarBloqueados(pid, pedidos.length, pedidos)).toBe(0);
      await c.query(`update platform.users set status = 'inactive' where id = $1`, [a1.id]);
      await c.query('commit');
      for (const p of pedidos) {
        const r = await p;
        expect([r.status, r.body.error?.code]).toEqual([403, 'ACCOUNT_INACTIVE']);
      }
    });
    expect(await filas()).toBe(antes);
    expect((await fila(a2.id)).status).toBe('active');
    expect(await owner('select 1 from platform.users where email = $1', [correo])).toHaveLength(0);
    expect(await owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1', [e.companyId]).then((r) => r[0].n)).toBe(rastrosAntes);
    await poner([a1.id], 'active');
  });

  it('dos administradores que se desactivan entre sí a la vez (12 rondas, sin un tercero activo): una sola baja se aplica, la otra es 403 ACCOUNT_INACTIVE; sin 500 ni deadlock y la empresa conserva un administrador activo', async () => {
    const { emp, admins } = await nuevaEmpresa('Cruce', 2);
    const [x, y] = admins;
    const [adminInicial] = await owner<{ id: string }>(`select id from platform.users where company_id = $1 and email = $2`, [emp.companyId, emp.email]);
    await poner([adminInicial.id], 'inactive'); // sin tercero
    for (let i = 0; i < 12; i++) {
      await poner([x.id, y.id], 'active');
      const [r1, r2] = await Promise.all([baja(x.session, y.id), baja(y.session, x.id)]);
      expect([r1.status, r2.status].sort()).toEqual([200, 403]);
      const fallo = r1.status === 403 ? r1 : r2;
      expect(fallo.body.error.code).toBe('ACCOUNT_INACTIVE');
      expect(await activos(emp.companyId)).toBe(1);
    }
  });

  it('reactivar a un tercero mientras se desactivan entre sí (12 rondas): sin 500 ni deadlock, y siempre queda un administrador activo', async () => {
    const { emp, admins } = await nuevaEmpresa('Reactiva', 3);
    const [x, y, z] = admins;
    const [adminInicial] = await owner<{ id: string }>(`select id from platform.users where company_id = $1 and email = $2`, [emp.companyId, emp.email]);
    await poner([adminInicial.id], 'inactive');
    for (let i = 0; i < 12; i++) {
      await poner([x.id, y.id], 'active');
      await poner([z.id], 'inactive');
      const rs = await Promise.all([
        x.session.patch(`/v1/users/${z.id}`).send({ status: 'active' }),
        baja(y.session, x.id),
        baja(x.session, y.id),
        y.session.patch(`/v1/users/${z.id}`).send({ status: 'active' }),
      ]);
      for (const r of rs) expect([200, 403]).toContain(r.status);
      expect(await activos(emp.companyId)).toBeGreaterThanOrEqual(1);
    }
  });

  it('crear a una persona, un grupo o renombrarlo con un actor al que otro administrador desactiva a la vez (12 rondas): 201/200 o 403, nunca 500, y lo que dio 403 no escribió nada', async () => {
    const { emp, admins } = await nuevaEmpresa('ActorBaja', 2);
    const [x, y] = admins;
    const grupo = (await emp.agent.post('/v1/groups').send({ name: `Base ${RUN} ${n++}` }).expect(201)).body.data.id;
    const pendiente = (await emp.agent.post('/v1/users').send({ email: email('pend'), name: 'P', last_name: 'P', role: 'auditor' }).expect(201)).body.data.id;
    for (let i = 0; i < 12; i++) {
      await poner([x.id], 'active');
      const correo = email('c');
      const nombreNuevo = `G ${RUN} ${n++}`;
      const [crear, crearGrupo, renombrar, reemitir, desactivar] = await Promise.all([
        x.session.post('/v1/users').send({ email: correo, name: 'N', last_name: 'N', role: 'auditor' }),
        x.session.post('/v1/groups').send({ name: nombreNuevo }),
        x.session.patch(`/v1/groups/${grupo}`).send({ name: `R ${RUN} ${n++}` }),
        x.session.post(`/v1/users/${pendiente}/activation-code`).send(),
        baja(y.session, x.id),
      ]);
      expect(desactivar.status).toBe(200);
      expect([201, 403]).toContain(crear.status);
      expect([201, 403]).toContain(crearGrupo.status);
      expect([200, 403]).toContain(renombrar.status);
      expect([200, 403]).toContain(reemitir.status);
      expect(await owner('select 1 from platform.users where email = $1', [correo])).toHaveLength(crear.status === 201 ? 1 : 0);
      expect(await owner('select 1 from platform.user_groups where name = $1', [nombreNuevo])).toHaveLength(crearGrupo.status === 201 ? 1 : 0);
      await y.session.patch(`/v1/users/${x.id}`).send({ status: 'active' }); // se repone para la ronda siguiente
    }
  });
});

describe('LAST_ADMIN solo al desactivarse', () => {
  it('«reactivarse» a uno mismo es un no-op (200, sin rastro) y corregir el nombre sigue valiendo; desactivarse es LAST_ADMIN', async () => {
    const antes = await nRastros();
    const res = await patch(adminId, { status: 'active' }).expect(200);
    expect(res.body.data).toMatchObject({ id: adminId, status: 'active' });
    expect(await nRastros()).toBe(antes);
    await patch(adminId, { status: 'active', name: res.body.data.name }).expect(200);
    expect((await patch(adminId, { status: 'inactive' }).expect(409)).body.error.code).toBe('LAST_ADMIN');
  });
});

describe('Grupos en el orden global (actor, grupo, líder, empresa)', () => {
  it('crear el equipo de un responsable cuya baja está en curso: espera su fila, ve que ya no es vigente y responde 404 sin crear nada', async () => {
    const r = await activo('responsable');
    const nombreGrupo = `Equipo ${RUN} ${n++}`;
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('select id from platform.users where id = $1 for update', [r.id]);
      const creando = a.agent.post('/v1/groups').send({ name: nombreGrupo, leader_id: r.id }).then((x) => x);
      expect(await esperarBloqueados(pid, 1, [creando])).toBe(0);
      await c.query(`update platform.users set status = 'inactive' where id = $1`, [r.id]);
      await c.query('commit');
      const res = await creando;
      expect([res.status, res.body.error.code]).toEqual([404, 'NOT_FOUND']);
    });
    expect(await owner('select 1 from platform.user_groups where name = $1', [nombreGrupo])).toHaveLength(0);
  });

  it('el administrador que crea el equipo de un responsable mientras lo desactivan a la vez: sin 500 ni deadlock (201 si entra antes; 404 si el responsable ya no está vigente)', async () => {
    for (let i = 0; i < 6; i++) {
      const r = await activo('responsable');
      const [crea, baja] = await Promise.all([a.agent.post('/v1/groups').send({ name: `Propio ${RUN} ${n++}`, leader_id: r.id }), patch(r.id, { status: 'inactive' })]);
      expect(baja.status).toBe(200);
      expect([201, 404, 409]).toContain(crea.status);
    }
  });

  it('renombrar un grupo en curso (su fila bloqueada): crear, mover y reactivar a alguien en él esperan; y a la inversa, alguien entrando bloquea el renombrado', async () => {
    const r = await responsableConEquipo();
    const mover = await activo('delegado', teamA);
    const dormido = await activo('delegado', r.team);
    await patch(dormido.id, { status: 'inactive' }).expect(200);
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('select id from platform.user_groups where id = $1 for no key update', [r.team]); // el renombrado, a medias
      const pedidos = [
        a.agent.post('/v1/users').send({ email: email('rn'), name: 'P', last_name: 'P', role: 'delegado', group_id: r.team, is_internal: true }),
        patch(mover.id, { group_id: r.team }),
        patch(dormido.id, { status: 'active' }),
      ].map((p) => p.then((x) => x));
      expect(await esperarBloqueados(pid, 3, pedidos)).toBe(0);
      await c.query('rollback');
      const [crea, mueve, reactiva] = await Promise.all(pedidos);
      expect([crea.status, mueve.status, reactiva.status]).toEqual([201, 200, 200]);
    });
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('select id from platform.user_groups where id = $1 for share', [r.team]); // alguien entrando, a medias
      const renombrando = a.agent.patch(`/v1/groups/${r.team}`).send({ name: `Renombrado ${RUN} ${n++}` }).then((x) => x);
      expect(await esperarBloqueados(pid, 1, [renombrando])).toBe(0);
      await c.query('rollback');
      expect((await renombrando).status).toBe(200);
    });
  });

  it('renombrar contra crear, mover y reactivar en el mismo grupo, 12 rondas: sin 500 ni deadlock', async () => {
    const r = await responsableConEquipo();
    const movible = await activo('delegado', teamA);
    const dormido = await activo('delegado', r.team);
    for (let i = 0; i < 12; i++) {
      await owner(`update platform.users set status = 'inactive', group_id = $2 where id = $1`, [dormido.id, r.team]);
      await owner(`update platform.users set group_id = $2 where id = $1`, [movible.id, teamA]);
      const rs = await Promise.all([
        a.agent.patch(`/v1/groups/${r.team}`).send({ name: `Vuelta ${RUN} ${n++}` }),
        a.agent.post('/v1/users').send({ email: email('rr'), name: 'P', last_name: 'P', role: 'delegado', group_id: r.team, is_internal: true }),
        patch(movible.id, { group_id: r.team }),
        patch(dormido.id, { status: 'active' }),
      ]);
      expect(rs.map((x) => x.status)).toEqual([200, 201, 200, 200]);
    }
  });
});

describe('Bajas simultáneas sobre la misma asignación (dueño y ejecutor)', () => {
  // created_at es `timestamp` sin zona (UTC): el instante se pide ya en ese formato para que el driver no lo reinterprete.
  const ahora = () => owner<{ t: string }>(`select to_char(clock_timestamp() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS') t`).then((r) => r[0].t);
  const entradasDesde = (since: string, controls: string[]) =>
    owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = 'control_assignment.set' and created_at >= $2::timestamp and after_state->>'client_control_id' = any($3::uuid[]::text[])`, [a.companyId, since, controls]).then((r) => r[0].n);
  const desasignadosDesde = (since: string, userId: string) =>
    owner<{ n: string | null }>(`select after_state->>'controls_unassigned' n from audit.audit_logs where tenant_id = $1 and action = 'user.update' and created_at >= $2::timestamp and after_state->>'id' = $3`, [a.companyId, since, userId]).then((r) => Number(r[0]?.n ?? 0));

  it('determinista: si la asignación cambia mientras la baja espera su fila, el rastro refleja lo que realmente borró', async () => {
    const dueno = await activo('responsable');
    const ejecutor = await activo('delegado', teamA);
    const cs = controles.slice(0, 4);
    for (const c of cs) await asignarControl(a.companyId, c, dueno.id, ejecutor.id);
    const desde = await ahora();
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('select id from platform.client_control_assignments where owner_id = $1 order by id for update', [dueno.id]); // la baja del ejecutor, a medias
      const baja = patch(dueno.id, { status: 'inactive', confirm_unassign: true }).then((x) => x);
      expect(await esperarBloqueados(pid, 1, [baja])).toBe(0);
      await c.query('update platform.client_control_assignments set executor_id = null where owner_id = $1', [dueno.id]);
      await c.query('commit');
      expect((await baja).status).toBe(200);
    });
    const porControl = await rastrosDe('control_assignment.set', dueno.id);
    expect(porControl).toHaveLength(4);
    for (const r of porControl) expect(r.before_state).toMatchObject({ owner_id: dueno.id, executor_id: null }); // la fila se leyó ya bloqueada: sin el ejecutor que ya no estaba
    expect((await rastrosDe('user.update', dueno.id))[0].after_state.controls_unassigned).toBe(4);
    expect(await entradasDesde(desde, cs)).toBe(4);
  });

  it('12 rondas: baja del dueño y del ejecutor a la vez; sin 500 ni deadlock y las entradas por control son exactamente los cambios efectivos', async () => {
    const dueno = await activo('responsable');
    const ejecutor = await activo('delegado', teamA); // la asignación se siembra en la base, sin pasar por la regla de equipo
    const cs = controles.slice(0, 4);
    for (let i = 0; i < 12; i++) {
      await owner(`update platform.users set status = 'active' where id = any($1::uuid[])`, [[dueno.id, ejecutor.id]]);
      await owner('update platform.sessions set revoked_at = null where user_id = any($1::uuid[])', [[dueno.id, ejecutor.id]]);
      for (const c of cs) await asignarControl(a.companyId, c, dueno.id, ejecutor.id);
      const desde = await ahora();
      const [bd, be] = await Promise.all([patch(dueno.id, { status: 'inactive', confirm_unassign: true }), patch(ejecutor.id, { status: 'inactive', confirm_unassign: true })]);
      expect([bd.status, be.status]).toEqual([200, 200]);
      const [delDueno, delEjecutor] = [await desasignadosDesde(desde, dueno.id), await desasignadosDesde(desde, ejecutor.id)];
      expect(delDueno).toBe(4); // el dueño siempre borra sus 4 asignaciones
      expect([0, 4]).toContain(delEjecutor); // el ejecutor las limpió antes (4) o ya no estaban (0)
      expect(await entradasDesde(desde, cs)).toBe(delDueno + delEjecutor); // una entrada por cambio efectivo, ni una de más
      for (const c of cs) expect(await asignacion(c)).toBeNull();
    }
  });
});

describe('Baja contra cierre de sesión de la misma persona (orden: usuario antes que sesión)', () => {
  it('determinista: el logout con la baja en curso espera la fila del usuario SIN haber tocado todavía su sesión; luego termina sin 500', async () => {
    const p = await activo('auditor');
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('select id from platform.users where id = $1 for update', [p.id]); // la baja, a medias
      const saliendo = p.session.post('/v1/auth/logout').send().then((x) => x);
      expect(await esperarBloqueados(pid, 1, [saliendo])).toBe(0);
      // Si el logout ya hubiera actualizado su sesión, esta fila estaría bloqueada.
      await pg(async (c2) => {
        await c2.query('begin');
        await c2.query('select id from platform.sessions where user_id = $1 for update nowait', [p.id]);
      });
      await c.query(`update platform.users set status = 'inactive' where id = $1`, [p.id]);
      await c.query('update platform.sessions set revoked_at = now() where user_id = $1 and revoked_at is null', [p.id]);
      await c.query('commit');
      expect([204, 401]).toContain((await saliendo).status);
    });
  });

  it('12 rondas: desactivar a X mientras X cierra sesión; sin 500 ni deadlock', async () => {
    const p = await activo('auditor');
    for (let i = 0; i < 12; i++) {
      await owner(`update platform.users set status = 'active' where id = $1`, [p.id]);
      await owner('update platform.sessions set revoked_at = null where user_id = $1', [p.id]);
      const [baja, salida] = await Promise.all([patch(p.id, { status: 'inactive' }), p.session.post('/v1/auth/logout').send()]);
      expect(baja.status).toBe(200);
      expect([204, 401]).toContain(salida.status);
      expect(await sesionesVivas(p.id)).toBe(0);
    }
  });
});

describe('Orden de bloqueo del actor y del sujeto por id (ambas inversiones)', () => {
  it('con el id mayor bloqueado por otra transacción, quien actúa ya tiene el menor tomado, sea actor o sujeto', async () => {
    const tres = [] as Array<{ id: string; session: Agent }>;
    for (let i = 0; i < 3; i++) tres.push(await invitarYActivar(app, a.agent, { email: email('ord'), name: 'A', last_name: 'A', role: 'admin_empresa' }));
    const [bajo, , alto] = tres.sort((x, y) => (x.id < y.id ? -1 : 1));
    const casos = [
      { actor: bajo, sujeto: alto }, // actor con id menor que el sujeto
      { actor: alto, sujeto: bajo }, // actor con id mayor que el sujeto
    ];
    for (const { actor, sujeto } of casos) {
      await pg(async (c, pid) => {
        await c.query('begin');
        await c.query('select id from platform.users where id = $1 for update', [alto.id]);
        const pedido = actor.session.patch(`/v1/users/${sujeto.id}`).send({ name: 'Cambiado' }).then((x) => x);
        expect(await esperarBloqueados(pid, 1, [pedido])).toBe(0);
        await pg(async (c2) => {
          await c2.query('begin');
          await expect(c2.query('select id from platform.users where id = $1 for update nowait', [bajo.id])).rejects.toMatchObject({ code: '55P03' }); // ya lo tiene la petición
        });
        await c.query('rollback');
        expect((await pedido).status).toBe(200);
      });
    }
  });
});
