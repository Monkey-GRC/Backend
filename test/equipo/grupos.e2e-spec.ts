import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { FileStorage } from '../../src/common/storage/file-storage';
import { Agent, bootApp, owner, RUN } from '../support/app';
import { asignarControl, controlesDe } from '../support/asignaciones';
import { invitarYActivar } from '../support/equipo';
import { connect } from '../support/db';
import { dosEmpresas, empresaConCupo, Tenant } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// D104 · Los grupos (contracts/gestion-usuarios.md · Grupos): listar, crear el equipo de delegados (el responsable el suyo, el administrador el de un responsable),
// renombrar y mover a un delegado. Todo por HTTP real contra el Postgres desechable, con el rol de la app (sujeto a RLS).
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let adminId: string;
const realInsert = auditInsert.insertAuditLog;
const email = (k: string) => `${k}-${RUN}@grupos.test`;
const nombre = (k: string) => `${k} ${RUN}`;
const fields = (res: { body: any }) => (res.body.error.fields as Array<{ field: string; code: string }>).map(({ field, code }) => ({ field, code }));
const rastros = (companyId: string, action: string) =>
  owner<{ user_id: string; tenant_id: string; resource: string; before_state: any; after_state: any }>(
    `select user_id, tenant_id, resource, before_state, after_state from audit.audit_logs where tenant_id = $1 and action = $2 order by created_at`,
    [companyId, action],
  );
const filaGrupo = (id: string) => owner<{ name: string; kind: string; leader_id: string }>('select name, kind::text, leader_id from platform.user_groups where id = $1', [id]).then((r) => r[0]);
const grupoDe = (userId: string) => owner<{ group_id: string | null }>('select group_id from platform.users where id = $1', [userId]).then((r) => r[0].group_id);
const nGrupos = (companyId: string) => owner<{ n: number }>('select count(*)::int n from platform.user_groups where company_id = $1', [companyId]).then((r) => r[0].n);
const grupoPorOmision = (companyId: string) => owner<{ id: string }>(`select id from platform.user_groups where company_id = $1 and name = 'Responsables'`, [companyId]).then((r) => r[0].id);
const ejecutorDe = (controlId: string) =>
  owner<{ owner_id: string; executor_id: string | null }>('select owner_id, executor_id from platform.client_control_assignments where client_control_id = $1', [controlId]).then((r) => r[0]);

type Rol = 'responsable' | 'delegado' | 'auditor';
const activo = (agent: Agent, k: string, role: Rol, group?: string) =>
  invitarYActivar(app, agent, { email: email(k), name: 'Persona', last_name: 'De Prueba', role, ...(role === 'delegado' ? { group_id: group, is_internal: true } : {}) });
const crearEquipo = async (agent: Agent, name: string, leaderId?: string) => (await agent.post('/v1/groups').send({ name, ...(leaderId ? { leader_id: leaderId } : {}) }).expect(201)).body.data;

let rA: { id: string; session: Agent }; // responsable con equipo creado por él
let rB: { id: string; session: Agent }; // responsable con equipo creado por el administrador
let teamA: string;
let teamB: string;
let delegada: { id: string; session: Agent };
let auditor: { id: string; session: Agent };

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(new StorageEnMemoria()));
  ({ a, b, monkey } = await dosEmpresas(app));
  adminId = (await owner<{ id: string }>('select id from platform.users where email = $1', [a.email]))[0].id;
  rA = await activo(a.agent, 'ra', 'responsable');
  rB = await activo(a.agent, 'rb', 'responsable');
  teamA = (await crearEquipo(rA.session, nombre('Equipo A'))).id;
  teamB = (await crearEquipo(a.agent, nombre('Equipo B'), rB.id)).id;
  delegada = await activo(a.agent, 'del', 'delegado', teamA);
  auditor = await activo(a.agent, 'aud', 'auditor');
});
afterAll(async () => {
  await app?.close();
});
afterEach(() => jest.restoreAllMocks());

describe('Quién puede qué', () => {
  it('sin sesión, 401 en los tres endpoints', async () => {
    const anon = request(app.getHttpServer());
    await anon.get('/v1/groups').expect(401);
    await anon.post('/v1/groups').send({ name: 'X' }).expect(401);
    await anon.patch(`/v1/groups/${teamA}`).send({ name: 'X' }).expect(401);
  });

  it('delegado, auditor y admin_monkey reciben 403 al listar, crear y renombrar; el responsable no renombra', async () => {
    for (const agent of [delegada.session, auditor.session, monkey]) {
      await agent.get('/v1/groups').expect(403);
      await agent.post('/v1/groups').send({ name: nombre('Intruso') }).expect(403);
      await agent.patch(`/v1/groups/${teamA}`).send({ name: nombre('Intruso') }).expect(403);
    }
    await rA.session.patch(`/v1/groups/${teamA}`).send({ name: nombre('Mío') }).expect(403);
    expect((await filaGrupo(teamA)).name).toBe(nombre('Equipo A'));
    expect(await owner('select 1 from platform.user_groups where name like $1', [`${nombre('Intruso')}%`])).toHaveLength(0);
  });

  it('el responsable no mueve delegados (PATCH /v1/users sigue siendo del administrador)', async () => {
    await rA.session.patch(`/v1/users/${delegada.id}`).send({ group_id: teamB }).expect(403);
    expect(await grupoDe(delegada.id)).toBe(teamA);
  });
});

describe('Crear un grupo', () => {
  it('el responsable crea SU equipo (team, él de líder, sin miembros) y ya puede crear delegados con POST /v1/users', async () => {
    const r = await activo(a.agent, 'flujo', 'responsable');
    const antes = await invitar(r.session, 'sin-eq').expect(409);
    expect(antes.body.error.code).toBe('RESPONSIBLE_HAS_NO_TEAM');

    const res = await r.session.post('/v1/groups').send({ name: nombre('Equipo Flujo') }).expect(201);
    expect(res.body.message).toBe('Listo, creamos el grupo.');
    expect(res.body.data).toEqual({
      id: expect.any(String), name: nombre('Equipo Flujo'), kind: 'team', members_count: 0,
      leader: { id: r.id, name: 'Persona', last_name: 'De Prueba', role: 'responsable' },
    });
    expect(await filaGrupo(res.body.data.id)).toMatchObject({ kind: 'team', leader_id: r.id });

    const d = (await invitar(r.session, 'flujo-d').expect(201)).body.data;
    expect(d.group.id).toBe(res.body.data.id);
    expect(d.responsible.id).toBe(r.id);
    const lista = (await r.session.get('/v1/groups').expect(200)).body.data.items;
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({ id: res.body.data.id, members_count: 1 });
  });

  it('el responsable puede mandar su propio leader_id; el de otra persona es 403 y no crea nada', async () => {
    const r = await activo(a.agent, 'propio', 'responsable');
    const antes = await nGrupos(a.companyId);
    for (const ajeno of [adminId, rA.id, '00000000-0000-0000-0000-000000000000']) {
      await r.session.post('/v1/groups').send({ name: nombre('Ajeno'), leader_id: ajeno }).expect(403);
    }
    expect(await nGrupos(a.companyId)).toBe(antes);
    const ok = await r.session.post('/v1/groups').send({ name: nombre('Equipo Propio'), leader_id: r.id }).expect(201);
    expect(ok.body.data).toMatchObject({ kind: 'team', leader: { id: r.id } });
  });

  it('un responsable lidera un solo equipo: el segundo, con otro nombre, es 409 TEAM_ALREADY_EXISTS (también si lo pide el administrador)', async () => {
    const antes = await nGrupos(a.companyId);
    const res = await rA.session.post('/v1/groups').send({ name: nombre('Otro equipo') }).expect(409);
    expect(res.body.error.code).toBe('TEAM_ALREADY_EXISTS');
    expect(res.body.message).toBe('Este responsable ya tiene un equipo de delegados: solo puede liderar uno.');
    expect((await a.agent.post('/v1/groups').send({ name: nombre('Otro equipo'), leader_id: rA.id }).expect(409)).body.error.code).toBe('TEAM_ALREADY_EXISTS');
    // Con el mismo nombre del equipo existente también es el equipo lo que se avisa.
    expect((await rA.session.post('/v1/groups').send({ name: nombre('Equipo A') }).expect(409)).body.error.code).toBe('TEAM_ALREADY_EXISTS');
    expect(await nGrupos(a.companyId)).toBe(antes);
  });

  it('el administrador crea el equipo de un responsable activo o pendiente; y un grupo de responsables si no manda leader_id', async () => {
    const pendiente = (await a.agent.post('/v1/users').send({ email: email('pend'), name: 'Pen', last_name: 'Diente', role: 'responsable' }).expect(201)).body.data;
    const res = await a.agent.post('/v1/groups').send({ name: nombre('Equipo Pendiente'), leader_id: pendiente.id }).expect(201);
    expect(res.body.data).toMatchObject({ kind: 'team', members_count: 0, leader: { id: pendiente.id, role: 'responsable' } });

    const grupo = await a.agent.post('/v1/groups').send({ name: nombre('Responsables - Servicio IA') }).expect(201);
    expect(grupo.body.data).toMatchObject({ kind: 'responsables', members_count: 0, leader: { id: adminId, role: 'admin_empresa' } });
    expect(await filaGrupo(grupo.body.data.id)).toMatchObject({ kind: 'responsables', leader_id: adminId });
  });

  it('el líder debe ser un responsable activo o pendiente de la empresa: si no, 404 y no se crea nada', async () => {
    const baja = await activo(a.agent, 'baja', 'responsable');
    await a.agent.patch(`/v1/users/${baja.id}`).send({ status: 'inactive' }).expect(200);
    const ajeno = (await b.agent.post('/v1/users').send({ email: email('b-resp'), name: 'B', last_name: 'B', role: 'responsable' }).expect(201)).body.data.id;
    const antes = await nGrupos(a.companyId);
    for (const leader of [baja.id, delegada.id, auditor.id, adminId, ajeno, '00000000-0000-0000-0000-000000000000']) {
      expect((await a.agent.post('/v1/groups').send({ name: nombre('Sin líder'), leader_id: leader }).expect(404)).body.error.code).toBe('NOT_FOUND');
    }
    expect(await nGrupos(a.companyId)).toBe(antes);
    expect(await nGrupos(b.companyId)).toBe(1); // solo «Responsables» de B
  });

  it('el nombre es obligatorio, de máx. 100 y único en la empresa (otra empresa puede repetirlo); leader_id debe ser uuid y no se admiten campos de más', async () => {
    expect(fields(await a.agent.post('/v1/groups').send({}).expect(422))).toEqual(expect.arrayContaining([{ field: 'name', code: 'required' }]));
    expect(fields(await a.agent.post('/v1/groups').send({ name: '   ' }).expect(422))).toEqual([{ field: 'name', code: 'required' }]);
    expect(fields(await a.agent.post('/v1/groups').send({ name: 'x'.repeat(101) }).expect(422))).toEqual([{ field: 'name', code: 'string.max' }]);
    expect(fields(await a.agent.post('/v1/groups').send({ name: 'Ok', leader_id: 'no-es-uuid' }).expect(422))).toEqual([{ field: 'leader_id', code: 'uuid.invalid' }]);
    expect(fields(await a.agent.post('/v1/groups').send({ name: 'Ok', kind: 'team' }).expect(422))).toEqual([{ field: 'kind', code: 'field.not_allowed' }]);
    await a.agent.post('/v1/groups').send({ name: 'x'.repeat(100) }).expect(201);

    const repetido = await a.agent.post('/v1/groups').send({ name: nombre('Equipo A') }).expect(409);
    expect(repetido.body.error.code).toBe('GROUP_NAME_TAKEN');
    expect(repetido.body.message).toContain('Ya existe un grupo con ese nombre');
    await b.agent.post('/v1/groups').send({ name: nombre('Equipo A') }).expect(201);
  });

  it('el nombre «Responsables» está reservado sin importar mayúsculas ni espacios, y el nombre se guarda sin espacios de más', async () => {
    const antes = await nGrupos(a.companyId);
    for (const reservado of ['Responsables', 'responsables', 'RESPONSABLES', '  Responsables  ', 'Responsables '.padEnd(20, ' '), 'Responsables']) {
      expect((await a.agent.post('/v1/groups').send({ name: reservado }).expect(409)).body.error.code).toBe('GROUP_NAME_TAKEN');
    }
    const r = await activo(a.agent, 'reservado', 'responsable');
    expect((await r.session.post('/v1/groups').send({ name: 'responsables' }).expect(409)).body.error.code).toBe('GROUP_NAME_TAKEN');
    expect(await nGrupos(a.companyId)).toBe(antes);
    // «Responsables - IA» no es el nombre reservado.
    const res = await a.agent.post('/v1/groups').send({ name: `  Responsables   -  ${RUN} ` }).expect(201);
    expect(res.body.data.name).toBe(`Responsables - ${RUN}`);
  });

  it('el rastro group.create lo escribe quien lo pidió, con la empresa, en la misma transacción: si falla, no queda el grupo', async () => {
    const rs = await rastros(a.companyId, 'group.create');
    const mio = rs.find((x) => x.after_state?.id === teamA);
    expect(mio).toMatchObject({ user_id: rA.id, tenant_id: a.companyId, resource: 'group', before_state: null, after_state: { id: teamA, name: nombre('Equipo A'), kind: 'team', leader_id: rA.id } });
    expect(rs.find((x) => x.after_state?.id === teamB)).toMatchObject({ user_id: adminId, after_state: { kind: 'team', leader_id: rB.id } });

    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    const antes = await nGrupos(a.companyId);
    await a.agent.post('/v1/groups').send({ name: nombre('Se revierte') }).expect(500);
    expect(await nGrupos(a.companyId)).toBe(antes);
    expect(await owner('select 1 from platform.user_groups where name = $1', [nombre('Se revierte')])).toHaveLength(0);
  });
});

describe('Concurrencia', () => {
  it('dos POST a la vez del mismo responsable: uno 201 y el otro 409 TEAM_ALREADY_EXISTS (lo garantiza el índice); un solo equipo en la base', async () => {
    for (let i = 0; i < 4; i++) {
      const r = await activo(a.agent, `conc-${i}`, 'responsable');
      const [x, y] = await Promise.all([r.session.post('/v1/groups').send({ name: nombre(`Conc ${i} x`) }), r.session.post('/v1/groups').send({ name: nombre(`Conc ${i} y`) })]);
      expect([x.status, y.status].sort()).toEqual([201, 409]);
      expect([x, y].find((res) => res.status === 409)?.body.error.code).toBe('TEAM_ALREADY_EXISTS');
      expect(await owner('select 1 from platform.user_groups where leader_id = $1', [r.id])).toHaveLength(1);
    }
  });

  it('el administrador y el responsable pidiendo a la vez el equipo del mismo responsable: uno solo se crea', async () => {
    const r = await activo(a.agent, 'conc-mix', 'responsable');
    const [x, y] = await Promise.all([r.session.post('/v1/groups').send({ name: nombre('Mix x') }), a.agent.post('/v1/groups').send({ name: nombre('Mix y'), leader_id: r.id })]);
    expect([x.status, y.status].sort()).toEqual([201, 409]);
    expect([x, y].find((res) => res.status === 409)?.body.error.code).toBe('TEAM_ALREADY_EXISTS');
  });

  it('dos POST a la vez con el mismo nombre: uno 201 y el otro 409 GROUP_NAME_TAKEN (nunca EMAIL_TAKEN)', async () => {
    const r1 = await activo(a.agent, 'conc-n1', 'responsable');
    const r2 = await activo(a.agent, 'conc-n2', 'responsable');
    const [x, y] = await Promise.all([r1.session.post('/v1/groups').send({ name: nombre('Mismo nombre') }), r2.session.post('/v1/groups').send({ name: nombre('Mismo nombre') })]);
    expect([x.status, y.status].sort()).toEqual([201, 409]);
    expect([x, y].find((res) => res.status === 409)?.body.error.code).toBe('GROUP_NAME_TAKEN');
    expect(await owner('select 1 from platform.user_groups where company_id = $1 and name = $2', [a.companyId, nombre('Mismo nombre')])).toHaveLength(1);
  });
});

describe('El grupo «Responsables» por omisión en una carrera', () => {
  it('si otra transacción lo crea justo antes, el alta espera y usa el que ganó (un administrador lo lidera); no hay 500 ni un segundo grupo', async () => {
    const e = await empresaConCupo(app, monkey, 'Carrera1', 10);
    const [admin] = await owner<{ id: string }>('select id from platform.users where email = $1', [e.email]);
    const otra = await connect();
    try {
      await otra.query('begin');
      const g = (await otra.query<{ id: string }>(`insert into platform.user_groups (id, company_id, name, kind, leader_id) values (gen_random_uuid(), $1, 'Responsables', 'responsables', $2) returning id`, [e.companyId, admin.id])).rows[0].id;
      let terminado = false;
      const pendiente = e.agent.post('/v1/users').send({ email: email('carrera1'), name: 'C', last_name: 'C', role: 'responsable' }).then((r) => {
        terminado = true;
        return r;
      });
      await new Promise((r) => setTimeout(r, 1500));
      expect(terminado).toBe(false);
      await otra.query('commit');
      const res = await pendiente;
      expect(res.status).toBe(201);
      expect(res.body.data.group.id).toBe(g);
      expect(await owner('select 1 from platform.user_groups where company_id = $1 and name = $2', [e.companyId, 'Responsables'])).toHaveLength(1);
    } finally {
      await otra.query('rollback').catch(() => undefined);
      await otra.end();
    }
  });

  it('si el que ganó la carrera no lo lidera un administrador (no es de responsables), el alta responde 409 RESPONSIBLES_GROUP_INVALID y no crea la cuenta', async () => {
    const e = await empresaConCupo(app, monkey, 'Carrera2', 10);
    const lider = await invitarYActivar(app, e.agent, { email: email('carrera2-l'), name: 'L', last_name: 'L', role: 'responsable' });
    // Quitamos el grupo por omisión de esta empresa para poder reproducir el caso: el responsable ya existente se queda sin grupo.
    await owner('update platform.users set group_id = null where id = $1', [lider.id]);
    await owner(`delete from platform.user_groups where company_id = $1 and name = 'Responsables'`, [e.companyId]);
    const otra = await connect();
    try {
      await otra.query('begin');
      await otra.query(`insert into platform.user_groups (id, company_id, name, kind, leader_id) values (gen_random_uuid(), $1, 'Responsables', 'team', $2)`, [e.companyId, lider.id]);
      let terminado = false;
      const pendiente = e.agent.post('/v1/users').send({ email: email('carrera2'), name: 'C', last_name: 'C', role: 'responsable' }).then((r) => {
        terminado = true;
        return r;
      });
      await new Promise((r) => setTimeout(r, 1500));
      expect(terminado).toBe(false);
      await otra.query('commit');
      const res = await pendiente;
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('RESPONSIBLES_GROUP_INVALID');
      expect(await owner('select 1 from platform.users where email = $1', [email('carrera2')])).toHaveLength(0);
    } finally {
      await otra.query('rollback').catch(() => undefined);
      await otra.end();
    }
  });
});

describe('Listar grupos', () => {
  it('el administrador ve todos los de su empresa con clase, líder y miembros; la otra empresa no aparece', async () => {
    const res = await a.agent.get('/v1/groups?page_size=100').expect(200);
    expect(res.body.message).toBe('Grupos de tu empresa.');
    const items = res.body.data.items as any[];
    expect(res.body.data).toMatchObject({ page: 1, page_size: 100, total: items.length, total_pages: 1 });
    const por = (id: string) => items.find((i) => i.id === id);
    expect(por(teamA)).toMatchObject({ kind: 'team', members_count: 1, leader: { id: rA.id, role: 'responsable' } });
    expect(por(teamB)).toMatchObject({ kind: 'team', members_count: 0, leader: { id: rB.id } });
    expect(por(await grupoPorOmision(a.companyId))).toMatchObject({ name: 'Responsables', kind: 'responsables', leader: { id: adminId, role: 'admin_empresa' }, members_count: expect.any(Number) });
    expect(Object.keys(items[0]).sort()).toEqual(['id', 'kind', 'leader', 'members_count', 'name']);
    expect(Object.keys(items[0].leader).sort()).toEqual(['id', 'last_name', 'name', 'role']);
    // No sale ninguno de B.
    const deB = (await owner<{ id: string }>('select id from platform.user_groups where company_id = $1', [b.companyId])).map((g) => g.id);
    for (const id of deB) expect(por(id)).toBeUndefined();
  });

  it('pagina y ordena por nombre', async () => {
    const p1 = (await a.agent.get('/v1/groups?page=1&page_size=2').expect(200)).body.data;
    expect(p1.items).toHaveLength(2);
    expect(p1.total_pages).toBe(Math.ceil(p1.total / 2));
    const p2 = (await a.agent.get('/v1/groups?page=2&page_size=2').expect(200)).body.data.items;
    expect(p2.map((i: any) => i.id)).not.toEqual(expect.arrayContaining(p1.items.map((i: any) => i.id)));
    const asc = (await a.agent.get('/v1/groups?page_size=100&sort=name').expect(200)).body.data.items.map((i: any) => i.id);
    const desc = (await a.agent.get('/v1/groups?page_size=100&sort=-name').expect(200)).body.data.items.map((i: any) => i.id);
    expect(desc).toEqual([...asc].reverse()); // el nombre es único por empresa: no hay empates
    expect(fields(await a.agent.get('/v1/groups?sort=kind').expect(422))).toEqual([{ field: 'sort', code: 'enum.invalid' }]);
  });

  it('el responsable ve solo el que lidera; sin equipo, la lista llega vacía (no falla)', async () => {
    const mio = (await rA.session.get('/v1/groups').expect(200)).body.data;
    expect(mio.items.map((i: any) => i.id)).toEqual([teamA]);
    expect(mio.total).toBe(1);
    const sin = await activo(a.agent, 'sin-eq-lista', 'responsable');
    const vacia = await sin.session.get('/v1/groups').expect(200);
    expect(vacia.body.data).toMatchObject({ items: [], total: 0, total_pages: 0 });
  });
});

describe('Renombrar un grupo', () => {
  it('el administrador renombra un equipo; queda el rastro group.update con antes y después', async () => {
    const x = (await crearEquipo(a.agent, nombre('Renombrable'), (await activo(a.agent, 'ren', 'responsable')).id)).id;
    const res = await a.agent.patch(`/v1/groups/${x}`).send({ name: `  ${nombre('Renombrado')}  ` }).expect(200);
    expect(res.body.message).toBe('Listo, guardamos los cambios del grupo.');
    expect(res.body.data).toMatchObject({ id: x, name: nombre('Renombrado'), kind: 'team' });
    expect((await filaGrupo(x)).name).toBe(nombre('Renombrado'));
    const r = (await rastros(a.companyId, 'group.update')).find((e) => e.after_state?.id === x);
    expect(r).toMatchObject({ user_id: adminId, tenant_id: a.companyId, resource: 'group', before_state: { name: nombre('Renombrable'), kind: 'team' }, after_state: { name: nombre('Renombrado'), kind: 'team' } });
    // Dejarle el mismo nombre no es un choque consigo mismo.
    await a.agent.patch(`/v1/groups/${x}`).send({ name: nombre('Renombrado') }).expect(200);
  });

  it('el grupo por omisión «Responsables» no se renombra (409 GROUP_RESERVED), ni con el mismo nombre; y ningún otro grupo puede llamarse así', async () => {
    const porOmision = await grupoPorOmision(a.companyId);
    const res = await a.agent.patch(`/v1/groups/${porOmision}`).send({ name: nombre('Otro nombre') }).expect(409);
    expect(res.body.error.code).toBe('GROUP_RESERVED');
    expect(res.body.message).toContain('no se puede renombrar');
    expect((await a.agent.patch(`/v1/groups/${porOmision}`).send({ name: 'Responsables' }).expect(409)).body.error.code).toBe('GROUP_RESERVED');
    expect((await filaGrupo(porOmision)).name).toBe('Responsables');
    for (const reservado of ['Responsables', ' RESPONSABLES ']) {
      expect((await a.agent.patch(`/v1/groups/${teamB}`).send({ name: reservado }).expect(409)).body.error.code).toBe('GROUP_NAME_TAKEN');
    }
    expect((await filaGrupo(teamB)).name).toBe(nombre('Equipo B'));
  });

  it('un nombre repetido es 409 GROUP_NAME_TAKEN; un grupo de responsables distinto sí se renombra', async () => {
    expect((await a.agent.patch(`/v1/groups/${teamB}`).send({ name: nombre('Equipo A') }).expect(409)).body.error.code).toBe('GROUP_NAME_TAKEN');
    expect((await filaGrupo(teamB)).name).toBe(nombre('Equipo B'));
    const g = (await a.agent.post('/v1/groups').send({ name: nombre('Responsables - Otro') }).expect(201)).body.data.id;
    await a.agent.patch(`/v1/groups/${g}`).send({ name: nombre('Responsables - Otro 2') }).expect(200);
  });

  it('404 si no existe, no es uuid o es de otra empresa; 422 con el nombre vacío o largo', async () => {
    const deB = await grupoPorOmision(b.companyId);
    for (const id of ['00000000-0000-0000-0000-000000000000', 'no-es-uuid', deB]) await a.agent.patch(`/v1/groups/${id}`).send({ name: nombre('X') }).expect(404);
    expect((await filaGrupo(deB)).name).toBe('Responsables');
    expect(fields(await a.agent.patch(`/v1/groups/${teamB}`).send({}).expect(422))).toEqual(expect.arrayContaining([{ field: 'name', code: 'required' }]));
    expect(fields(await a.agent.patch(`/v1/groups/${teamB}`).send({ name: 'x'.repeat(101) }).expect(422))).toEqual([{ field: 'name', code: 'string.max' }]);
    expect(fields(await a.agent.patch(`/v1/groups/${teamB}`).send({ name: 'Ok', kind: 'responsables' }).expect(422))).toEqual([{ field: 'kind', code: 'field.not_allowed' }]);
  });

  it('si el rastro falla, el nombre no cambia', async () => {
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    await a.agent.patch(`/v1/groups/${teamB}`).send({ name: nombre('No queda') }).expect(500);
    expect((await filaGrupo(teamB)).name).toBe(nombre('Equipo B'));
  });
});

describe('Aislamiento entre empresas (RLS)', () => {
  it('B no ve, no renombra ni crea el equipo de un responsable de A', async () => {
    const listaB = (await b.agent.get('/v1/groups?page_size=100').expect(200)).body.data.items as any[];
    expect(listaB.map((i) => i.id)).not.toContain(teamA);
    for (const g of listaB) expect(['responsables', 'team']).toContain(g.kind);
    await b.agent.patch(`/v1/groups/${teamA}`).send({ name: nombre('Robado') }).expect(404);
    expect((await filaGrupo(teamA)).name).toBe(nombre('Equipo A'));
    expect((await b.agent.post('/v1/groups').send({ name: nombre('Equipo espía'), leader_id: rA.id }).expect(404)).body.error.code).toBe('NOT_FOUND');
    expect(await owner('select 1 from platform.user_groups where name = $1', [nombre('Equipo espía')])).toHaveLength(0);
  });

  it('el administrador de A no ve los grupos de B, y B no cambia nada de A al mover un delegado', async () => {
    const deB = (await owner<{ id: string }>('select id from platform.user_groups where company_id = $1', [b.companyId])).map((g) => g.id);
    const idsA = ((await a.agent.get('/v1/groups?page_size=100').expect(200)).body.data.items as any[]).map((i) => i.id);
    for (const id of deB) expect(idsA).not.toContain(id);
    await b.agent.patch(`/v1/users/${delegada.id}`).send({ group_id: deB[0] }).expect(404);
    expect(await grupoDe(delegada.id)).toBe(teamA);
  });
});

describe('Mover a un delegado de equipo', () => {
  let controles: string[];
  const mover = (id: string, body: object, agent: Agent = a.agent) => agent.patch(`/v1/users/${id}`).send(body);
  const nuevoDelegado = async (k: string, group: string) => activo(a.agent, k, 'delegado', group);
  const miembrosDe = (g: string) => owner<{ n: number }>('select count(*)::int n from platform.users where group_id = $1', [g]).then((r) => r[0].n);

  beforeAll(async () => {
    controles = await controlesDe(a.serviceId);
    expect(controles.length).toBeGreaterThanOrEqual(3);
  });

  it('sin controles: se mueve, la respuesta trae el grupo y el responsable nuevos, y queda el rastro con group_id antes y después', async () => {
    const d = await nuevoDelegado('mv-libre', teamA);
    const res = await mover(d.id, { group_id: teamB }).expect(200);
    expect(res.body.message).toBe('Listo, guardamos los cambios de la cuenta.');
    expect(res.body.data).toMatchObject({ id: d.id, role: 'delegado', group: { id: teamB, name: nombre('Equipo B') }, responsible: { id: rB.id } });
    expect(await grupoDe(d.id)).toBe(teamB);
    const r = (await rastros(a.companyId, 'user.update')).filter((e) => e.after_state?.id === d.id).pop();
    expect(r).toMatchObject({ user_id: adminId, before_state: { group_id: teamA }, after_state: { group_id: teamB } });
    expect(r?.after_state).not.toHaveProperty('controls_unassigned');
    // Los conteos de la lista siguen al delegado.
    const items = (await a.agent.get('/v1/groups?page_size=100').expect(200)).body.data.items as any[];
    expect(items.find((i) => i.id === teamB).members_count).toBe(await miembrosDe(teamB));
  });

  it('el mismo equipo no cambia nada: ni el grupo ni los controles que ejecuta, y no pide confirmación', async () => {
    const d = await nuevoDelegado('mv-igual', teamA);
    await asignarControl(a.companyId, controles[0], rA.id, d.id);
    const antes = (await rastros(a.companyId, 'user.update')).filter((e) => e.after_state?.id === d.id).length;
    const res = await mover(d.id, { group_id: teamA }).expect(200);
    expect(res.body.data.group.id).toBe(teamA);
    expect((await rastros(a.companyId, 'user.update')).filter((e) => e.after_state?.id === d.id)).toHaveLength(antes); // no cambió nada: no hay rastro
    // Si además corrige el nombre, sí hay cambio y sí hay rastro.
    await mover(d.id, { group_id: teamA, name: 'Corregido' }).expect(200);
    expect((await rastros(a.companyId, 'user.update')).filter((e) => e.after_state?.id === d.id)).toHaveLength(antes + 1);
    expect((await ejecutorDe(controles[0])).executor_id).toBe(d.id);
    expect(await grupoDe(d.id)).toBe(teamA);
  });

  it('si ejecuta controles y no hay confirm_unassign: 409 USER_HAS_ASSIGNMENTS con controls_count, y no cambia nada', async () => {
    const d = await nuevoDelegado('mv-ocupado', teamA);
    await asignarControl(a.companyId, controles[1], rA.id, d.id);
    await asignarControl(a.companyId, controles[2], rA.id, d.id);
    for (const body of [{ group_id: teamB }, { group_id: teamB, confirm_unassign: false }]) {
      const res = await mover(d.id, body).expect(409);
      expect(res.body.error).toMatchObject({ code: 'USER_HAS_ASSIGNMENTS', controls_count: 2 });
      expect(res.body.message).toContain('ejecuta controles');
    }
    expect(await grupoDe(d.id)).toBe(teamA);
    expect((await ejecutorDe(controles[1])).executor_id).toBe(d.id);
    expect((await ejecutorDe(controles[2])).executor_id).toBe(d.id);
  });

  it('con confirm_unassign: se mueve, sus controles quedan sin ejecutor y con su dueño, y el rastro cuenta cuántos', async () => {
    const d = await nuevoDelegado('mv-confirma', teamA);
    const otro = await nuevoDelegado('mv-confirma-otro', teamA);
    await asignarControl(a.companyId, controles[3], rA.id, d.id);
    await asignarControl(a.companyId, controles[4], rA.id, d.id);
    await asignarControl(a.companyId, controles[5], rA.id, otro.id); // el de otro delegado no se toca
    await mover(d.id, { group_id: teamB, confirm_unassign: true }).expect(200);
    expect(await grupoDe(d.id)).toBe(teamB);
    expect(await ejecutorDe(controles[3])).toEqual({ owner_id: rA.id, executor_id: null });
    expect(await ejecutorDe(controles[4])).toEqual({ owner_id: rA.id, executor_id: null });
    expect(await ejecutorDe(controles[5])).toEqual({ owner_id: rA.id, executor_id: otro.id });
    const r = (await rastros(a.companyId, 'user.update')).filter((e) => e.after_state?.id === d.id).pop();
    expect(r).toMatchObject({ before_state: { group_id: teamA }, after_state: { group_id: teamB, controls_unassigned: 2 } });
  });

  it('confirm_unassign sin group_id no hace nada por sí solo: la baja con aviso no es de este corte', async () => {
    const d = await nuevoDelegado('mv-solo-confirma', teamA);
    await asignarControl(a.companyId, controles[6] ?? controles[0], rA.id, d.id);
    expect(fields(await mover(d.id, { confirm_unassign: true }).expect(422))).toEqual([{ field: 'status', code: 'required' }]);
    expect(await grupoDe(d.id)).toBe(teamA);
  });

  it('solo se mueve a un delegado: responsable, auditor y administrador son 422 group_id.not_allowed', async () => {
    for (const id of [rB.id, auditor.id, adminId]) {
      expect(fields(await mover(id, { group_id: teamB }).expect(422))).toEqual([{ field: 'group_id', code: 'group_id.not_allowed' }]);
    }
    expect(await grupoDe(rB.id)).toBe(await grupoPorOmision(a.companyId));
    expect(await grupoDe(auditor.id)).toBeNull();
  });

  it('el destino debe ser el team de un responsable activo o pendiente de la empresa: si no, 404 y el delegado queda donde estaba', async () => {
    const d = await nuevoDelegado('mv-destino', teamA);
    await asignarControl(a.companyId, controles[0], rA.id, d.id);
    const inactivo = await activo(a.agent, 'mv-inactivo', 'responsable');
    const equipoInactivo = (await crearEquipo(a.agent, nombre('Equipo inactivo'), inactivo.id)).id;
    await a.agent.patch(`/v1/users/${inactivo.id}`).send({ status: 'inactive' }).expect(200);
    const deB = await grupoPorOmision(b.companyId);
    const deResponsables = await grupoPorOmision(a.companyId);
    for (const destino of ['00000000-0000-0000-0000-000000000000', deB, deResponsables, equipoInactivo]) {
      expect((await mover(d.id, { group_id: destino, confirm_unassign: true }).expect(404)).body.error.code).toBe('NOT_FOUND');
    }
    expect(await grupoDe(d.id)).toBe(teamA);
    expect((await ejecutorDe(controles[0])).executor_id).toBe(d.id); // ni siquiera con confirmación se tocó
    // Un destino pendiente sí sirve.
    const pend = (await a.agent.post('/v1/users').send({ email: email('mv-pend'), name: 'P', last_name: 'P', role: 'responsable' }).expect(201)).body.data.id;
    const equipoPend = (await crearEquipo(a.agent, nombre('Equipo pendiente'), pend)).id;
    await mover(d.id, { group_id: equipoPend, confirm_unassign: true }).expect(200);
    expect(await grupoDe(d.id)).toBe(equipoPend);
    await mover(d.id, { group_id: 'no-es-uuid' }).expect(422);
  });

  it('el cambio de grupo, la limpieza de ejecutores y el rastro son una sola transacción: si el rastro falla, nada cambia', async () => {
    const d = await nuevoDelegado('mv-atomico', teamA);
    await asignarControl(a.companyId, controles[0], rA.id, d.id);
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    await mover(d.id, { group_id: teamB, confirm_unassign: true }).expect(500);
    expect(await grupoDe(d.id)).toBe(teamA);
    expect((await ejecutorDe(controles[0])).executor_id).toBe(d.id);
  });

  it('una asignación de ejecutor que aún no se confirma se serializa con el movimiento: el movimiento espera y luego la limpia', async () => {
    const d = await nuevoDelegado('mv-carrera', teamA);
    const control = controles[controles.length - 1];
    expect(controles.length).toBeGreaterThanOrEqual(8); // el último control no lo usa ninguna otra prueba
    const otra = await connect();
    try {
      await otra.query('begin');
      // Otra transacción asigna al delegado como ejecutor (el FK toma KEY SHARE sobre su fila) y aún no confirma.
      await otra.query(
        `insert into platform.client_control_assignments (id, company_id, client_control_id, owner_id, executor_id, assigned_by, updated_at) values (gen_random_uuid(), $1, $2, $3, $4, $5, now())
         on conflict (client_control_id) do update set executor_id = excluded.executor_id`,
        [a.companyId, control, rA.id, d.id, adminId],
      );
      let terminado = false;
      const pendiente = mover(d.id, { group_id: teamB, confirm_unassign: true }).then((r) => {
        terminado = true;
        return r;
      });
      await new Promise((r) => setTimeout(r, 1500));
      expect(terminado).toBe(false); // espera la fila del delegado
      await otra.query('commit');
      const res = await pendiente;
      expect(res.status).toBe(200);
      expect(await ejecutorDe(control)).toEqual({ owner_id: rA.id, executor_id: null });
      expect(await grupoDe(d.id)).toBe(teamB);
      const r = (await rastros(a.companyId, 'user.update')).filter((e) => e.after_state?.id === d.id).pop();
      expect(r?.after_state).toMatchObject({ group_id: teamB, controls_unassigned: 1 });
    } finally {
      await otra.query('rollback').catch(() => undefined);
      await otra.end();
    }
  });

  it('un delegado movido ya no es del equipo de antes: el responsable anterior no lo lista y el nuevo sí', async () => {
    const d = await nuevoDelegado('mv-lista', teamA);
    await mover(d.id, { group_id: teamB }).expect(200);
    const mails = (res: { body: any }) => (res.body.data.items as any[]).map((i) => i.email);
    expect(mails(await rA.session.get('/v1/users?page_size=100').expect(200))).not.toContain(email('mv-lista'));
    expect(mails(await rB.session.get('/v1/users?page_size=100').expect(200))).toContain(email('mv-lista'));
  });
});

// Reutilizado por el flujo del responsable: invita un delegado a su equipo (sin group_id).
function invitar(agent: Agent, k: string) {
  return agent.post('/v1/users').send({ email: email(k), name: 'Persona', last_name: 'De Prueba', role: 'delegado', is_internal: true });
}
