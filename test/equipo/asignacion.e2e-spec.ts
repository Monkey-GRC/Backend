import type { INestApplication } from '@nestjs/common';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { FileStorage } from '../../src/common/storage/file-storage';
import { compareOwnCode } from '../../src/features/compliance/domain/controls/control-readout';
import { Agent, bootApp, owner, RUN } from '../support/app';
import { asignarControl, controlesDe } from '../support/asignaciones';
import { conPg as pg, esperarBloqueados } from '../support/bloqueos';
import { invitarYActivar, sembrarEquipo } from '../support/equipo';
import { dosEmpresas, servicePayload, Tenant } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-192 · SEG-73 · Asignar dueño y ejecutor y listar la asignación (contracts/gestion-usuarios.md · Asignación de controles): por HTTP real contra el Postgres desechable, con el rol de la app (RLS).
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let adminId: string;
let controles: string[]; // los controles vigentes del servicio de A, por código
let servicio2: string; // un segundo servicio de A
let controles2: string[];
let controlPropio: string;
let rA: { id: string; session: Agent; team: string };
let rA2: { id: string; session: Agent; team: string };
let rSin: { id: string; session: Agent }; // responsable sin equipo (D104)
let dA: { id: string; session: Agent };
let dA2: { id: string; session: Agent };
let dOtro: { id: string; session: Agent }; // delegado del equipo de rA2
let auditor: { id: string; session: Agent };
let rB: string;
let dB: string;
let controlesB: string[];
let n = 0;
const email = (k: string) => `${k}-${RUN}-${n++}@asignacion.test`;
const fields = (res: { body: any }) => (res.body.error.fields as Array<{ field: string; code: string }>).map(({ field, code }) => ({ field, code }));

type Rol = 'admin_empresa' | 'responsable' | 'delegado' | 'auditor';
const activo = (role: Rol, group?: string, agent: Agent = a.agent) =>
  invitarYActivar(app, agent, { email: email(role), name: 'Persona', last_name: 'De Prueba', role, ...(role === 'delegado' ? { group_id: group, is_internal: true } : {}) });
const responsableConEquipo = async () => {
  const r = await activo('responsable');
  return { ...r, team: await sembrarEquipo(a.companyId, r.id, `Equipo ${RUN} ${n++}`) };
};
const pendiente = async (role: 'responsable' | 'delegado', group?: string) =>
  (await a.agent.post('/v1/users').send({ email: email(`pend-${role}`), name: 'Pendiente', last_name: 'P', role, ...(role === 'delegado' ? { group_id: group, is_internal: false } : {}) }).expect(201)).body.data.id as string;
const baja = (id: string) => a.agent.patch(`/v1/users/${id}`).send({ status: 'inactive', confirm_unassign: true });

const putOwner = (ids: string[], ownerId: string | null, agent: Agent = a.agent) => agent.put('/v1/assignments/owner').send({ client_control_ids: ids, owner_id: ownerId });
const putExecutor = (ids: string[], executorId: string | null, agent: Agent = rA.session) => agent.put('/v1/assignments/executor').send({ client_control_ids: ids, executor_id: executorId });
const todos = async (agent: Agent, query = '') => {
  const items: any[] = [];
  for (let page = 1; ; page++) {
    const d = (await agent.get(`/v1/assignments?${query}${query ? '&' : ''}page=${page}&page_size=100`).expect(200)).body.data;
    items.push(...d.items);
    if (page >= d.total_pages) return items;
  }
};
const ids = (items: any[]) => items.map((i) => i.client_control_id);

const asignacion = (controlId: string) =>
  owner<{ owner_id: string; executor_id: string | null; assigned_by: string }>('select owner_id, executor_id, assigned_by from platform.client_control_assignments where client_control_id = $1', [controlId]).then((r) => r[0] ?? null);
const nFilas = () => owner<{ n: number }>('select count(*)::int n from platform.client_control_assignments where company_id = $1', [a.companyId]).then((r) => r[0].n);
const fila = (id: string) => owner<{ status: string; group_id: string | null }>('select status::text, group_id from platform.users where id = $1', [id]).then((r) => r[0]);
// created_at es `timestamp` sin zona (UTC): el instante se pide ya en ese formato para que el driver no lo reinterprete.
const ahora = () => owner<{ t: string }>(`select to_char(clock_timestamp() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS') t`).then((r) => r[0].t);
const rastros = (since: string, controls: string[]) =>
  owner<{ user_id: string; tenant_id: string; resource: string; before_state: any; after_state: any }>(
    `select user_id, tenant_id, resource, before_state, after_state from audit.audit_logs where tenant_id = $1 and action = 'control_assignment.set' and created_at >= $2::timestamp and after_state->>'client_control_id' = any($3::uuid[]::text[])
      order by after_state->>'client_control_id', created_at`,
    [a.companyId, since, controls],
  );
const estado = (controlId: string, ownerId: string | null, executorId: string | null) => ({ client_control_id: controlId, owner_id: ownerId, executor_id: executorId });

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(new StorageEnMemoria()));
  ({ a, b, monkey } = await dosEmpresas(app));
  adminId = (await owner<{ id: string }>('select id from platform.users where email = $1', [a.email]))[0].id;
  controles = await controlesDe(a.serviceId);
  expect(controles.length).toBeGreaterThanOrEqual(8);
  servicio2 = (await a.agent.post('/v1/services').send(servicePayload(`Otro servicio ${RUN}`)).expect(201)).body.data.id;
  controles2 = await controlesDe(servicio2);
  controlPropio = (await a.agent.post(`/v1/services/${a.serviceId}/controls`).send({ name: 'Revisión trimestral de proveedores', interpretation: 'Cada trimestre TI revisa a los proveedores críticos.', trust_criterion: 'security' }).expect(201)).body.data.id;

  rA = await responsableConEquipo();
  rA2 = await responsableConEquipo();
  rSin = await activo('responsable');
  dA = await activo('delegado', rA.team);
  dA2 = await activo('delegado', rA.team);
  dOtro = await activo('delegado', rA2.team);
  auditor = await activo('auditor');

  rB = (await invitarYActivar(app, b.agent, { email: email('rb'), name: 'P', last_name: 'P', role: 'responsable' })).id;
  const teamB = await sembrarEquipo(b.companyId, rB, `Equipo B ${RUN}`);
  dB = (await invitarYActivar(app, b.agent, { email: email('db'), name: 'P', last_name: 'P', role: 'delegado', group_id: teamB, is_internal: true })).id;
  controlesB = await controlesDe(b.serviceId);
});
afterAll(async () => {
  await app?.close();
});
beforeEach(async () => {
  await owner('delete from platform.client_control_assignments where company_id = any($1::uuid[])', [[a.companyId, b.companyId]]);
});
afterEach(() => jest.restoreAllMocks());

describe('B4 · Clonar no crea asignaciones: todo control nace «Sin asignar»', () => {
  // `beforeEach` limpia las asignaciones: aquí se cuentan las que el clonado deja por sí mismo, antes de sembrar nada.
  it('crear un servicio clona sus controles y no escribe en client_control_assignments', async () => {
    const nombre = `Servicio clonado ${RUN}`;
    const antes = await nFilas();
    const creado = (await a.agent.post('/v1/services').send(servicePayload(nombre)).expect(201)).body.data.id;
    const clonados = await controlesDe(creado);
    expect(clonados.length).toBeGreaterThan(0);
    expect(await nFilas()).toBe(antes);
    const lista = await todos(a.agent, `service_id=${creado}`);
    expect(ids(lista).sort()).toEqual([...clonados].sort());
    for (const i of lista) expect(i).toMatchObject({ assignment: 'unassigned', owner: null, executor: null });
  });

  it('ampliar las categorías de un servicio (recalcula y clona más controles) tampoco asigna a nadie', async () => {
    const servicio = (await a.agent.post('/v1/services').send(servicePayload(`Servicio ampliado ${RUN}`)).expect(201)).body.data.id;
    const antes = (await controlesDe(servicio)).length;
    await a.agent.patch(`/v1/services/${servicio}`).send({ trust_criteria: ['security', 'confidentiality', 'availability', 'privacy', 'integrity'] }).expect(200);
    expect((await controlesDe(servicio)).length).toBeGreaterThan(antes);
    expect(await nFilas()).toBe(0);
    for (const i of await todos(a.agent, `service_id=${servicio}`)) expect(i.assignment).toBe('unassigned');
  });
});

describe('GET /v1/assignments · quién ve qué', () => {
  beforeEach(async () => {
    await asignarControl(a.companyId, controles[0], rA.id, dA.id);
    await asignarControl(a.companyId, controles[1], rA.id);
    await asignarControl(a.companyId, controles[2], rA2.id, dOtro.id);
  });

  it('admin_empresa y auditor ven todos los controles vigentes; el resto de empresas, ninguno', async () => {
    const delAdmin = await todos(a.agent);
    const vigentes = (await owner<{ n: number }>('select count(*)::int n from tenant.client_controls cc join tenant.services s on s.id = cc.service_id where cc.is_active and s.tenant_id = $1', [a.companyId]))[0].n;
    expect(delAdmin.length).toBe(vigentes);
    expect(ids(delAdmin)).toEqual(expect.arrayContaining([...controles, ...controles2, controlPropio]));
    expect(await todos(auditor.session)).toEqual(delAdmin);
    const deB = await todos(b.agent);
    expect(ids(deB).sort()).toEqual([...controlesB].sort());
    expect(ids(deB).some((id) => delAdmin.some((x) => x.client_control_id === id))).toBe(false);
  });

  it('el responsable ve los controles de los que es dueño (incluidos los que ejecuta su delegado); el delegado, los que ejecuta', async () => {
    expect(ids(await todos(rA.session)).sort()).toEqual([controles[0], controles[1]].sort());
    expect(ids(await todos(rA2.session))).toEqual([controles[2]]);
    expect(ids(await todos(dA.session))).toEqual([controles[0]]);
    expect(ids(await todos(dOtro.session))).toEqual([controles[2]]);
  });

  it('sin ningún control, la lista llega vacía (no es un error)', async () => {
    for (const s of [rSin.session, dA2.session]) {
      const d = (await s.get('/v1/assignments').expect(200)).body.data;
      expect(d).toMatchObject({ items: [], total: 0, total_pages: 0 });
    }
  });

  it('admin_monkey, 403; sin sesión, 401', async () => {
    await monkey.get('/v1/assignments').expect(403);
    await a.agent.get('/v1/assignments').expect(200);
    const sinSesion = (await import('supertest')).default(app.getHttpServer());
    await sinSesion.get('/v1/assignments').expect(401);
  });

  it('la forma del contrato: código D80, requisitos, nombre, servicio, categorías, asignación, dueño, ejecutor y estado', async () => {
    const item = (await todos(a.agent, `service_id=${a.serviceId}`)).find((i) => i.client_control_id === controles[0]);
    expect(item).toEqual({
      client_control_id: controles[0],
      code: expect.stringMatching(/^[A-Z]+-\d+$/),
      requirement_codes: expect.any(Array),
      name: expect.any(String),
      service: { id: a.serviceId, name: a.serviceName },
      categories: expect.any(Array),
      assignment: 'assigned',
      owner: { id: rA.id, name: 'Persona', last_name: 'De Prueba', role: 'responsable' },
      executor: { id: dA.id, name: 'Persona', last_name: 'De Prueba', role: 'delegado' },
      state: expect.stringMatching(/^(effective|ineffective|expired|error|incomplete|evaluating|no_tests)$/),
    });
    const propio = (await todos(a.agent, 'q=Revision trimestral')).find((i) => i.client_control_id === controlPropio);
    expect(propio).toMatchObject({ code: 'C01', requirement_codes: [], categories: [], assignment: 'unassigned', owner: null, executor: null });
  });

  it('un control dado de baja no se lista', async () => {
    const c = (await a.agent.post(`/v1/services/${a.serviceId}/controls`).send({ name: 'Para la baja', interpretation: 'Se da de baja.', trust_criterion: 'security' }).expect(201)).body.data.id as string;
    expect(ids(await todos(a.agent))).toContain(c);
    await a.agent.delete(`/v1/controls/${c}`).expect(204);
    expect(ids(await todos(a.agent))).not.toContain(c);
  });
});

describe('GET /v1/assignments · filtros, orden y paginación', () => {
  let todosLosA: any[];
  beforeEach(async () => {
    await asignarControl(a.companyId, controles[0], rA.id, dA.id);
    await asignarControl(a.companyId, controles[1], rA.id);
    await asignarControl(a.companyId, controles2[0], rA2.id);
    todosLosA = await todos(a.agent);
  });
  const categoriaDe = (code: string) => /^[A-Za-z]*/.exec(code)?.[0] ?? '';

  it('ordena por servicio (nombre) y luego por código: IAC-2 antes que IAC-10', () => {
    const esperado = [...todosLosA].sort((x, y) => x.service.name.localeCompare(y.service.name, 'es') || compareOwnCode(x.code, y.code));
    expect(ids(todosLosA)).toEqual(ids(esperado));
    expect(new Set(todosLosA.map((i) => i.service.id)).size).toBeGreaterThanOrEqual(2);
  });

  it('category=CC toma los controles con algún requisito CC<número>: no C1.1, ni los propios; categories sale del prefijo', async () => {
    const cc = await todos(a.agent, 'category=CC');
    expect(cc.length).toBeGreaterThan(0);
    for (const i of cc) {
      expect(i.categories).toContain('CC');
      expect(i.requirement_codes.some((c: string) => /^CC\d/.test(c))).toBe(true);
    }
    expect(ids(cc).sort()).toEqual(ids(todosLosA.filter((i) => i.requirement_codes.some((c: string) => /^CC\d/.test(c)))).sort());
    for (const i of todosLosA) expect(i.categories).toEqual([...new Set(i.requirement_codes.map(categoriaDe))].filter(Boolean).sort());
    const soloC = await todos(a.agent, 'category=C');
    for (const i of soloC) expect(i.requirement_codes.some((c: string) => /^C\d/.test(c))).toBe(true);
    expect(ids(cc)).not.toContain(controlPropio);
  });

  it('requirement_code es el código exacto', async () => {
    const codigo = todosLosA.flatMap((i) => i.requirement_codes)[0] as string;
    const lista = await todos(a.agent, `requirement_code=${encodeURIComponent(codigo)}`);
    expect(lista.length).toBeGreaterThan(0);
    for (const i of lista) expect(i.requirement_codes).toContain(codigo);
    expect(lista.length).toBe(todosLosA.filter((i) => i.requirement_codes.includes(codigo)).length);
    expect(await todos(a.agent, `requirement_code=${encodeURIComponent(codigo.slice(0, -1))}`)).toEqual(todosLosA.filter((i) => i.requirement_codes.includes(codigo.slice(0, -1))));
  });

  it('assignment=unassigned y assigned; owner_id y executor_id', async () => {
    expect(ids(await todos(a.agent, 'assignment=assigned')).sort()).toEqual([controles[0], controles[1], controles2[0]].sort());
    const sin = await todos(a.agent, 'assignment=unassigned');
    expect(sin.length).toBe(todosLosA.length - 3);
    for (const i of sin) expect(i).toMatchObject({ assignment: 'unassigned', owner: null });
    expect(ids(await todos(a.agent, `owner_id=${rA.id}`)).sort()).toEqual([controles[0], controles[1]].sort());
    expect(ids(await todos(a.agent, `executor_id=${dA.id}`))).toEqual([controles[0]]);
    expect(await todos(a.agent, `owner_id=${rA.id}&executor_id=${dA2.id}`)).toEqual([]);
  });

  it('status se calcula por servicio y se filtra y pagina después: coincide con el estado del listado de controles', async () => {
    const tecnico = new Map<string, string>();
    for (const s of [a.serviceId, servicio2]) {
      const d = (await a.agent.get(`/v1/services/${s}/controls?view=technical&page_size=100`).expect(200)).body.data;
      for (const c of d.items) tecnico.set(c.id, c.technical.control_state);
    }
    for (const i of todosLosA) if (tecnico.has(i.client_control_id)) expect(i.state).toBe(tecnico.get(i.client_control_id));
    const estados = [...new Set(todosLosA.map((i) => i.state))];
    expect(estados.length).toBeGreaterThan(0);
    for (const s of estados) {
      const lista = await todos(a.agent, `status=${s}`);
      expect(ids(lista)).toEqual(ids(todosLosA.filter((i) => i.state === s)));
    }
    const una = estados[0];
    const total = todosLosA.filter((i) => i.state === una).length;
    const p1 = (await a.agent.get(`/v1/assignments?status=${una}&page=1&page_size=2`).expect(200)).body.data;
    expect(p1).toMatchObject({ total, page: 1, page_size: 2, total_pages: Math.ceil(total / 2) });
    expect(p1.items.every((i: any) => i.state === una)).toBe(true);
    if (!estados.includes('effective')) expect(await todos(a.agent, 'status=effective')).toEqual([]);
  });

  it('q busca sin distinguir mayúsculas ni acentos en el código, los requisitos y el nombre', async () => {
    const primero = todosLosA.find((i) => i.requirement_codes.length > 0);
    const porCodigo = await todos(a.agent, `q=${encodeURIComponent(primero.code.toLowerCase())}`);
    expect(ids(porCodigo)).toContain(primero.client_control_id);
    const porRequisito = await todos(a.agent, `q=${encodeURIComponent(primero.requirement_codes[0].toLowerCase())}`);
    expect(ids(porRequisito)).toContain(primero.client_control_id);
    // En la v2 los requisitos de varios controles del catálogo también dicen «revisión trimestral»: el propio tiene que estar, igual con o sin acento y mayúsculas.
    const conAcento = ids(await todos(a.agent, 'q=REVISIÓN TRIMESTRAL'));
    expect(conAcento).toContain(controlPropio);
    expect(ids(await todos(a.agent, 'q=revision%20trimestral')).sort()).toEqual([...conAcento].sort());
    expect(await todos(a.agent, 'q=zzz-no-existe')).toEqual([]);
  });

  it('todos los filtros se combinan', async () => {
    const lista = await todos(a.agent, `service_id=${a.serviceId}&assignment=assigned&owner_id=${rA.id}&category=CC&status=${todosLosA.find((i) => i.client_control_id === controles[0]).state}`);
    const esperado = todosLosA.filter((i) => i.service.id === a.serviceId && i.owner?.id === rA.id && i.categories.includes('CC') && i.state === todosLosA.find((x) => x.client_control_id === controles[0]).state);
    expect(ids(lista)).toEqual(ids(esperado));
    expect(await todos(a.agent, `service_id=${servicio2}&owner_id=${rA.id}`)).toEqual([]);
    const sinAsignarCC = await todos(a.agent, `service_id=${a.serviceId}&assignment=unassigned&category=CC`);
    expect(ids(sinAsignarCC)).toEqual(ids(todosLosA.filter((i) => i.service.id === a.serviceId && i.assignment === 'unassigned' && i.categories.includes('CC'))));
    expect(sinAsignarCC.length).toBeGreaterThan(0);
    // El responsable combina sus filtros con su alcance: nunca amplía lo que ve.
    expect(ids(await todos(rA.session, `owner_id=${rA2.id}`))).toEqual([]);
    expect(ids(await todos(rA.session, 'assignment=unassigned'))).toEqual([]);
  });

  it('framework_id: los controles que cubren requisitos de ese marco; otro marco, ninguno', async () => {
    const [soc2] = await owner<{ id: string }>("select id from catalog.frameworks where code = 'soc2'");
    const [iso] = await owner<{ id: string }>("select id from catalog.frameworks where code = 'iso27001'");
    const conMarco = await todos(a.agent, `framework_id=${soc2.id}`);
    expect(ids(conMarco)).toEqual(ids(todosLosA.filter((i) => i.requirement_codes.length > 0)));
    expect(await todos(a.agent, `framework_id=${iso.id}`)).toEqual([]);
  });

  it('pagina: total, total_pages y el mismo orden página a página', async () => {
    const total = todosLosA.length;
    const vistos: string[] = [];
    for (let page = 1; page <= Math.ceil(total / 7); page++) {
      const d = (await a.agent.get(`/v1/assignments?page=${page}&page_size=7`).expect(200)).body.data;
      expect(d).toMatchObject({ page, page_size: 7, total, total_pages: Math.ceil(total / 7) });
      vistos.push(...ids(d.items));
    }
    expect(vistos).toEqual(ids(todosLosA));
    expect((await a.agent.get(`/v1/assignments?page=${Math.ceil(total / 7) + 1}&page_size=7`).expect(200)).body.data.items).toEqual([]);
  });

  it('422: valores fuera de su enum, uuid mal formado y página inválida', async () => {
    expect(fields(await a.agent.get('/v1/assignments?status=otro').expect(422))).toEqual([{ field: 'status', code: 'enum.invalid' }]);
    expect(fields(await a.agent.get('/v1/assignments?assignment=otro').expect(422))).toEqual([{ field: 'assignment', code: 'enum.invalid' }]);
    expect(fields(await a.agent.get('/v1/assignments?owner_id=no-es-uuid&service_id=x').expect(422))).toEqual(
      expect.arrayContaining([{ field: 'owner_id', code: 'uuid.invalid' }, { field: 'service_id', code: 'uuid.invalid' }]),
    );
    await a.agent.get('/v1/assignments?page_size=0').expect(422);
    await a.agent.get('/v1/assignments?page_size=101').expect(422);
  });
});

describe('PUT /v1/assignments/owner · quién puede', () => {
  it('solo admin_empresa: responsable, delegado, auditor y admin_monkey, 403; sin sesión, 401', async () => {
    for (const s of [rA.session, dA.session, auditor.session, monkey]) await putOwner([controles[0]], rA.id, s).expect(403);
    await (await import('supertest')).default(app.getHttpServer()).put('/v1/assignments/owner').send({ client_control_ids: [controles[0]], owner_id: rA.id }).expect(401);
    expect(await nFilas()).toBe(0);
    const res = await putOwner([controles[0]], rA.id).expect(200);
    expect(res.body.data).toEqual({ updated: 1 });
  });
});

describe('PUT /v1/assignments/owner · asignar, reasignar y dejar «Sin asignar»', () => {
  it('asigna a varios controles: updated cuenta los que cambian, GET lo muestra y cada uno deja su control_assignment.set exacto', async () => {
    const cs = controles.slice(0, 3);
    const desde = await ahora();
    expect((await putOwner(cs, rA.id).expect(200)).body.data).toEqual({ updated: 3 });
    for (const c of cs) expect(await asignacion(c)).toEqual({ owner_id: rA.id, executor_id: null, assigned_by: adminId });
    const lista = await todos(a.agent, 'assignment=assigned');
    expect(ids(lista).sort()).toEqual([...cs].sort());
    for (const i of lista) expect(i.owner).toMatchObject({ id: rA.id, role: 'responsable' });
    const r = await rastros(desde, cs);
    expect(r).toHaveLength(3);
    for (const x of r) {
      expect(x).toMatchObject({ user_id: adminId, tenant_id: a.companyId, resource: 'control_assignment' });
      expect(x.before_state).toEqual(estado(x.after_state.client_control_id, null, null));
      expect(x.after_state).toEqual(estado(x.after_state.client_control_id, rA.id, null));
    }
  });

  it('lo que ya tenía ese dueño no cuenta ni deja rastro; mandar lo mismo otra vez es updated 0', async () => {
    await putOwner([controles[0], controles[1]], rA.id).expect(200);
    const desde = await ahora();
    expect((await putOwner([controles[0], controles[1], controles[2]], rA.id).expect(200)).body.data).toEqual({ updated: 1 });
    expect((await rastros(desde, controles)).map((x) => x.after_state.client_control_id)).toEqual([controles[2]]);
    const desde2 = await ahora();
    expect((await putOwner([controles[0], controles[1], controles[2]], rA.id).expect(200)).body.data).toEqual({ updated: 0 });
    expect(await rastros(desde2, controles)).toHaveLength(0);
  });

  it('cambiar el dueño limpia el ejecutor; con el mismo dueño, el ejecutor se conserva', async () => {
    await asignarControl(a.companyId, controles[0], rA.id, dA.id);
    await asignarControl(a.companyId, controles[1], rA.id, dA.id);
    const desde = await ahora();
    expect((await putOwner([controles[0]], rA2.id).expect(200)).body.data).toEqual({ updated: 1 });
    expect(await asignacion(controles[0])).toMatchObject({ owner_id: rA2.id, executor_id: null, assigned_by: adminId });
    expect((await putOwner([controles[1]], rA.id).expect(200)).body.data).toEqual({ updated: 0 });
    expect(await asignacion(controles[1])).toMatchObject({ owner_id: rA.id, executor_id: dA.id });
    const [x] = await rastros(desde, controles);
    expect(x.before_state).toEqual(estado(controles[0], rA.id, dA.id));
    expect(x.after_state).toEqual(estado(controles[0], rA2.id, null));
  });

  it('el propio admin_empresa puede ser el dueño, y un responsable pendiente también', async () => {
    expect((await putOwner([controles[0]], adminId).expect(200)).body.data).toEqual({ updated: 1 });
    expect(await asignacion(controles[0])).toMatchObject({ owner_id: adminId });
    const pend = await pendiente('responsable');
    expect((await putOwner([controles[1]], pend).expect(200)).body.data).toEqual({ updated: 1 });
    expect(await asignacion(controles[1])).toMatchObject({ owner_id: pend });
  });

  it('owner_id null deja «Sin asignar» (la fila se borra, y el ejecutor con ella): updated cuenta solo los que tenían dueño', async () => {
    await asignarControl(a.companyId, controles[0], rA.id, dA.id);
    await asignarControl(a.companyId, controles[1], rA2.id);
    const desde = await ahora();
    expect((await putOwner([controles[0], controles[1], controles[2]], null).expect(200)).body.data).toEqual({ updated: 2 });
    for (const c of controles.slice(0, 3)) expect(await asignacion(c)).toBeNull();
    const r = await rastros(desde, controles);
    expect(r).toHaveLength(2);
    expect(r.find((x) => x.after_state.client_control_id === controles[0])).toMatchObject({ before_state: estado(controles[0], rA.id, dA.id), after_state: estado(controles[0], null, null) });
    for (const i of await todos(a.agent, `service_id=${a.serviceId}`)) expect(i).toMatchObject({ assignment: 'unassigned', owner: null, executor: null });
    expect((await putOwner([controles[0]], null).expect(200)).body.data).toEqual({ updated: 0 });
  });

  it('hasta 200 controles en una petición', async () => {
    const lote = (await owner<{ id: string }>('select cc.id from tenant.client_controls cc join tenant.services s on s.id = cc.service_id where cc.is_active and s.tenant_id = $1 order by cc.id limit 200', [a.companyId])).map((r) => r.id);
    expect(lote).toHaveLength(200);
    expect((await putOwner(lote, rA.id).expect(200)).body.data).toEqual({ updated: 200 });
    expect(await nFilas()).toBe(200);
  });
});

describe('PUT /v1/assignments/owner · errores: no cambia nada ni deja rastro', () => {
  const sinCambios = async (fn: () => Promise<void>) => {
    await asignarControl(a.companyId, controles[3], rA2.id, dOtro.id);
    const desde = await ahora();
    await fn();
    expect(await nFilas()).toBe(1);
    expect(await asignacion(controles[3])).toMatchObject({ owner_id: rA2.id, executor_id: dOtro.id });
    expect(await rastros(desde, controles)).toHaveLength(0);
  };

  it('dueño no elegible: delegado, auditor, otro admin_empresa, responsable inactivo: 409 OWNER_NOT_ELIGIBLE (un admin_monkey es de otra empresa: 404)', async () => {
    const otroAdmin = await activo('admin_empresa');
    const inactivo = await activo('responsable');
    await baja(inactivo.id).expect(200);
    await sinCambios(async () => {
      for (const id of [dA.id, auditor.id, otroAdmin.id, inactivo.id]) {
        const res = await putOwner(controles.slice(0, 2), id).expect(409);
        expect(res.body.error.code).toBe('OWNER_NOT_ELIGIBLE');
      }
      await putOwner(controles.slice(0, 2), (await owner<{ id: string }>("select id from platform.users where role = 'admin_monkey' limit 1"))[0].id).expect(404);
    });
  });

  it('otra empresa y ids que no existen: 404 (un control o el dueño); todo o nada', async () => {
    await sinCambios(async () => {
      await putOwner([controles[0], controlesB[0]], rA.id).expect(404);
      await putOwner([controles[0], '00000000-0000-4000-8000-000000000000'], rA.id).expect(404);
      await putOwner([controles[0]], rB).expect(404);
      await putOwner([controles[0]], '00000000-0000-4000-8000-000000000000').expect(404);
      await b.agent.put('/v1/assignments/owner').send({ client_control_ids: [controles[0]], owner_id: rB }).expect(404);
    });
  });

  it('un control dado de baja cancela toda la operación: 409 CONTROL_RETIRED y nada cambia (con dueño y con null)', async () => {
    const baja1 = (await a.agent.post(`/v1/services/${a.serviceId}/controls`).send({ name: 'Retirado uno', interpretation: 'Se retira.', trust_criterion: 'security' }).expect(201)).body.data.id as string;
    await a.agent.delete(`/v1/controls/${baja1}`).expect(204);
    await sinCambios(async () => {
      const res = await putOwner([controles[0], baja1, controles[1]], rA.id).expect(409);
      expect(res.body.error.code).toBe('CONTROL_RETIRED');
      expect((await putOwner([controles[3], baja1], null).expect(409)).body.error.code).toBe('CONTROL_RETIRED');
      expect((await putOwner([baja1], rA.id).expect(409)).body.error.code).toBe('CONTROL_RETIRED');
    });
  });

  it('422: array.min, array.max, array.unique, uuid inválido y owner_id que falta o no es uuid', async () => {
    await sinCambios(async () => {
      const raw = (body: object) => a.agent.put('/v1/assignments/owner').send(body);
      expect(fields(await raw({ client_control_ids: [], owner_id: rA.id }).expect(422))).toEqual([{ field: 'client_control_ids', code: 'array.min' }]);
      const muchos = Array.from({ length: 201 }, (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`);
      expect(fields(await raw({ client_control_ids: muchos, owner_id: rA.id }).expect(422))).toEqual([{ field: 'client_control_ids', code: 'array.max' }]);
      expect(fields(await raw({ client_control_ids: [controles[0], controles[0]], owner_id: rA.id }).expect(422))).toEqual([{ field: 'client_control_ids', code: 'array.unique' }]);
      expect(fields(await raw({ client_control_ids: ['no-es-uuid'], owner_id: rA.id }).expect(422))).toEqual([{ field: 'client_control_ids', code: 'uuid.invalid' }]);
      expect(fields(await raw({ client_control_ids: [controles[0]], owner_id: 'no-es-uuid' }).expect(422))).toEqual([{ field: 'owner_id', code: 'uuid.invalid' }]);
      expect(fields(await raw({ client_control_ids: [controles[0]] }).expect(422)).map((f) => f.field)).toContain('owner_id');
      expect(fields(await raw({ owner_id: rA.id }).expect(422)).map((f) => f.field)).toContain('client_control_ids');
      await raw({ client_control_ids: [controles[0]], owner_id: rA.id, otro: 1 }).expect(422);
    });
  });

  it('atomicidad: si el rastro falla, no queda ninguna asignación', async () => {
    const real = auditInsert.insertAuditLog;
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await real(db, entry);
      throw new Error('el rastro falla');
    });
    await putOwner(controles.slice(0, 3), rA.id).expect(500);
    expect(await nFilas()).toBe(0);
  });
});

describe('PUT /v1/assignments/executor · quién puede', () => {
  beforeEach(async () => {
    await asignarControl(a.companyId, controles[0], rA.id);
    await asignarControl(a.companyId, controles[1], rA.id);
  });

  it('solo responsable: admin_empresa, delegado, auditor y admin_monkey, 403; sin sesión, 401', async () => {
    for (const s of [a.agent, dA.session, auditor.session, monkey]) await putExecutor([controles[0]], dA.id, s).expect(403);
    await (await import('supertest')).default(app.getHttpServer()).put('/v1/assignments/executor').send({ client_control_ids: [controles[0]], executor_id: dA.id }).expect(401);
    expect((await asignacion(controles[0]))?.executor_id).toBeNull();
    expect((await putExecutor([controles[0]], dA.id).expect(200)).body.data).toEqual({ updated: 1 });
  });

  it('solo sobre controles de los que es dueño: ajeno, sin dueño o de otro responsable, 403 y no cambia nada', async () => {
    await asignarControl(a.companyId, controles[2], rA2.id);
    const desde = await ahora();
    for (const c of [controles[2], controles[3]]) await putExecutor([controles[0], c], dA.id).expect(403);
    expect((await asignacion(controles[0]))?.executor_id).toBeNull();
    expect(await asignacion(controles[3])).toBeNull();
    expect(await rastros(desde, controles)).toHaveLength(0);
  });
});

describe('PUT /v1/assignments/executor · asignar y quitar', () => {
  beforeEach(async () => {
    await asignarControl(a.companyId, controles[0], rA.id);
    await asignarControl(a.companyId, controles[1], rA.id, dA2.id);
    await asignarControl(a.companyId, controles[2], rA.id, dA.id);
  });

  it('pone el ejecutor, conserva al dueño, el delegado lo ve en su lista y cada cambio deja su rastro exacto; lo que ya tenía no cuenta', async () => {
    const desde = await ahora();
    expect((await putExecutor(controles.slice(0, 3), dA.id).expect(200)).body.data).toEqual({ updated: 2 });
    for (const c of controles.slice(0, 3)) expect(await asignacion(c)).toMatchObject({ owner_id: rA.id, executor_id: dA.id });
    expect(await asignacion(controles[0])).toMatchObject({ assigned_by: rA.id });
    expect(ids(await todos(dA.session)).sort()).toEqual(controles.slice(0, 3).sort());
    expect(ids(await todos(dA2.session))).toEqual([]);
    const r = await rastros(desde, controles);
    expect(r).toHaveLength(2);
    expect(r.find((x) => x.after_state.client_control_id === controles[0])).toMatchObject({ user_id: rA.id, tenant_id: a.companyId, resource: 'control_assignment', before_state: estado(controles[0], rA.id, null), after_state: estado(controles[0], rA.id, dA.id) });
    expect(r.find((x) => x.after_state.client_control_id === controles[1])).toMatchObject({ before_state: estado(controles[1], rA.id, dA2.id), after_state: estado(controles[1], rA.id, dA.id) });
    const desde2 = await ahora();
    expect((await putExecutor(controles.slice(0, 3), dA.id).expect(200)).body.data).toEqual({ updated: 0 });
    expect(await rastros(desde2, controles)).toHaveLength(0);
  });

  it('un delegado pendiente del equipo vale; null quita el ejecutor (ejecuta el dueño)', async () => {
    const pend = await pendiente('delegado', rA.team);
    expect((await putExecutor([controles[0]], pend).expect(200)).body.data).toEqual({ updated: 1 });
    const desde = await ahora();
    expect((await putExecutor(controles.slice(0, 3), null).expect(200)).body.data).toEqual({ updated: 3 });
    for (const c of controles.slice(0, 3)) expect(await asignacion(c)).toMatchObject({ owner_id: rA.id, executor_id: null });
    const r = await rastros(desde, controles);
    expect(r.find((x) => x.after_state.client_control_id === controles[2])).toMatchObject({ before_state: estado(controles[2], rA.id, dA.id), after_state: estado(controles[2], rA.id, null) });
  });

  const sinCambios = async (fn: () => Promise<void>) => {
    const desde = await ahora();
    await fn();
    expect(await asignacion(controles[0])).toMatchObject({ executor_id: null });
    expect(await asignacion(controles[1])).toMatchObject({ executor_id: dA2.id });
    expect(await rastros(desde, controles)).toHaveLength(0);
  };

  it('ejecutor no elegible: de otro equipo, responsable, auditor, admin, inactivo: 409 EXECUTOR_NOT_IN_TEAM', async () => {
    const inactivo = await activo('delegado', rA.team);
    await baja(inactivo.id).expect(200);
    await sinCambios(async () => {
      for (const id of [dOtro.id, rA2.id, rA.id, auditor.id, adminId, inactivo.id]) {
        const res = await putExecutor(controles.slice(0, 2), id).expect(409);
        expect(res.body.error.code).toBe('EXECUTOR_NOT_IN_TEAM');
      }
    });
  });

  it('un responsable sin equipo solo puede quitar: con un delegado, 409; con null, 200', async () => {
    await asignarControl(a.companyId, controles[4], rSin.id);
    expect((await putExecutor([controles[4]], dA.id, rSin.session).expect(409)).body.error.code).toBe('EXECUTOR_NOT_IN_TEAM');
    expect((await putExecutor([controles[4]], dOtro.id, rSin.session).expect(409)).body.error.code).toBe('EXECUTOR_NOT_IN_TEAM');
    expect((await putExecutor([controles[4]], null, rSin.session).expect(200)).body.data).toEqual({ updated: 0 });
    expect(await asignacion(controles[4])).toMatchObject({ owner_id: rSin.id, executor_id: null });
  });

  it('otra empresa e inexistentes: 404; un control dado de baja: 409 CONTROL_RETIRED; todo o nada', async () => {
    const retirado = (await a.agent.post(`/v1/services/${a.serviceId}/controls`).send({ name: 'Retirado dos', interpretation: 'Se retira.', trust_criterion: 'security' }).expect(201)).body.data.id as string;
    await asignarControl(a.companyId, retirado, rA.id);
    await a.agent.delete(`/v1/controls/${retirado}`).expect(204);
    await sinCambios(async () => {
      await putExecutor([controles[0], controlesB[0]], dA.id).expect(404);
      await putExecutor([controles[0], '00000000-0000-4000-8000-000000000000'], dA.id).expect(404);
      await putExecutor([controles[0]], dB).expect(404);
      await putExecutor([controles[0]], '00000000-0000-4000-8000-000000000000').expect(404);
      expect((await putExecutor([controles[0], retirado], dA.id).expect(409)).body.error.code).toBe('CONTROL_RETIRED');
      expect((await putExecutor([controles[0], retirado], null).expect(409)).body.error.code).toBe('CONTROL_RETIRED');
    });
  });

  it('422: array.min, array.max, array.unique, uuid inválido y executor_id que falta', async () => {
    await sinCambios(async () => {
      const raw = (body: object) => rA.session.put('/v1/assignments/executor').send(body);
      expect(fields(await raw({ client_control_ids: [], executor_id: dA.id }).expect(422))).toEqual([{ field: 'client_control_ids', code: 'array.min' }]);
      const muchos = Array.from({ length: 201 }, (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`);
      expect(fields(await raw({ client_control_ids: muchos, executor_id: dA.id }).expect(422))).toEqual([{ field: 'client_control_ids', code: 'array.max' }]);
      expect(fields(await raw({ client_control_ids: [controles[0], controles[0]], executor_id: dA.id }).expect(422))).toEqual([{ field: 'client_control_ids', code: 'array.unique' }]);
      expect(fields(await raw({ client_control_ids: [controles[0]], executor_id: 'no-es-uuid' }).expect(422))).toEqual([{ field: 'executor_id', code: 'uuid.invalid' }]);
      expect(fields(await raw({ client_control_ids: [controles[0]] }).expect(422)).map((f) => f.field)).toContain('executor_id');
    });
  });

  it('atomicidad: si el rastro falla, el ejecutor no cambia', async () => {
    const real = auditInsert.insertAuditLog;
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await real(db, entry);
      throw new Error('el rastro falla');
    });
    await putExecutor(controles.slice(0, 3), dA.id).expect(500);
    expect((await asignacion(controles[0]))?.executor_id).toBeNull();
    expect((await asignacion(controles[1]))?.executor_id).toBe(dA2.id);
  });
});

describe('Concurrencia · orden de bloqueos (actor y persona por id, controles, asignaciones)', () => {
  it('asignar un ejecutor mientras se mueve al delegado (FOR UPDATE): espera, relee su grupo y responde 409 EXECUTOR_NOT_IN_TEAM sin escribir', async () => {
    const mudable = await activo('delegado', rA.team);
    await asignarControl(a.companyId, controles[0], rA.id);
    const desde = await ahora();
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('select id from platform.users where id = $1 for update', [mudable.id]); // el movimiento (MD-189), a medias
      const asignando = putExecutor([controles[0]], mudable.id).then((x) => x);
      expect(await esperarBloqueados(pid, 1, [asignando])).toBe(0);
      await c.query('update platform.users set group_id = $2 where id = $1', [mudable.id, rA2.team]);
      await c.query('commit');
      const res = await asignando;
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('EXECUTOR_NOT_IN_TEAM');
    });
    expect((await asignacion(controles[0]))?.executor_id).toBeNull();
    expect(await rastros(desde, controles)).toHaveLength(0);
  });

  it('asignar un ejecutor mientras se desactiva al delegado (FOR UPDATE): espera y responde 409 EXECUTOR_NOT_IN_TEAM sin escribir', async () => {
    const saliente = await activo('delegado', rA.team);
    await asignarControl(a.companyId, controles[0], rA.id);
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('select id from platform.users where id = $1 for update', [saliente.id]); // la baja (MD-191), a medias
      const asignando = putExecutor([controles[0]], saliente.id).then((x) => x);
      expect(await esperarBloqueados(pid, 1, [asignando])).toBe(0);
      await c.query(`update platform.users set status = 'inactive' where id = $1`, [saliente.id]);
      await c.query('commit');
      expect((await asignando).body.error.code).toBe('EXECUTOR_NOT_IN_TEAM');
    });
    expect((await asignacion(controles[0]))?.executor_id).toBeNull();
  });

  it('asignar un dueño mientras se desactiva a esa persona (FOR UPDATE): espera y responde 409 OWNER_NOT_ELIGIBLE sin escribir', async () => {
    const saliente = await activo('responsable');
    const desde = await ahora();
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('select id from platform.users where id = $1 for update', [saliente.id]);
      const asignando = putOwner(controles.slice(0, 2), saliente.id).then((x) => x);
      expect(await esperarBloqueados(pid, 1, [asignando])).toBe(0);
      await c.query(`update platform.users set status = 'inactive' where id = $1`, [saliente.id]);
      await c.query('commit');
      const res = await asignando;
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('OWNER_NOT_ELIGIBLE');
    });
    expect(await nFilas()).toBe(0);
    expect(await rastros(desde, controles)).toHaveLength(0);
  });

  it('una asignación en curso (KEY SHARE sobre el dueño) hace esperar a la baja, que luego ve las asignaciones y las libera', async () => {
    const entrante = await activo('responsable');
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('select id from platform.users where id = $1 for key share', [entrante.id]);
      await c.query(
        `insert into platform.client_control_assignments (id, company_id, client_control_id, owner_id, assigned_by, updated_at) values (gen_random_uuid(), $1, $2, $3, $4, now())`,
        [a.companyId, controles[0], entrante.id, adminId],
      );
      const bajando = baja(entrante.id).then((x) => x);
      expect(await esperarBloqueados(pid, 1, [bajando])).toBe(0);
      await c.query('commit');
      expect((await bajando).status).toBe(200);
    });
    expect(await asignacion(controles[0])).toBeNull();
    expect((await fila(entrante.id)).status).toBe('inactive');
  });

  it('dar de baja un control mientras se asigna (fila del control): la asignación espera y responde 409 CONTROL_RETIRED', async () => {
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('update tenant.client_controls set is_active = false where id = $1', [controles[5]]);
      const asignando = putOwner([controles[4], controles[5]], rA.id).then((x) => x);
      expect(await esperarBloqueados(pid, 1, [asignando])).toBe(0);
      await c.query('commit');
      expect((await asignando).body.error.code).toBe('CONTROL_RETIRED');
    });
    await owner('update tenant.client_controls set is_active = true where id = $1', [controles[5]]);
    expect(await nFilas()).toBe(0);
  });

  it('dos asignaciones sobre los mismos controles se turnan (filas de los controles): el rastro encadena el antes y el después', async () => {
    const cs = controles.slice(0, 3);
    const desde = await ahora();
    let resultados: Array<{ status: number; body: any }> = [];
    await pg(async (c, pid) => {
      await c.query('begin');
      await c.query('select id from tenant.client_controls where id = any($1::uuid[]) order by id for no key update', [cs]);
      const uno = putOwner(cs, rA.id).then((x) => x);
      const dos = putOwner(cs, rA2.id).then((x) => x);
      expect(await esperarBloqueados(pid, 2, [uno, dos])).toBe(0);
      await c.query('commit');
      resultados = await Promise.all([uno, dos]);
    });
    expect(resultados.map((r) => r.status)).toEqual([200, 200]);
    const porControl = new Map<string, any[]>();
    for (const x of await rastros(desde, cs)) porControl.set(x.after_state.client_control_id, [...(porControl.get(x.after_state.client_control_id) ?? []), x]);
    for (const c of cs) {
      const [primero, segundo] = porControl.get(c) as any[];
      expect(porControl.get(c)).toHaveLength(2);
      expect(primero.before_state.owner_id).toBeNull();
      expect(segundo.before_state.owner_id).toBe(primero.after_state.owner_id);
      expect((await asignacion(c))?.owner_id).toBe(segundo.after_state.owner_id);
    }
  });

  it('12 rondas: asignar un ejecutor a la vez que se mueve al delegado; nunca queda un ejecutor fuera del equipo y el rastro cuadra con las filas', async () => {
    const delegado = await activo('delegado', rA.team);
    const cs = controles.slice(0, 3);
    for (let i = 0; i < 12; i++) {
      await owner('update platform.users set group_id = $2 where id = $1', [delegado.id, rA.team]);
      for (const c of cs) await asignarControl(a.companyId, c, rA.id);
      const desde = await ahora();
      const [x, y] = await Promise.all([putExecutor(cs, delegado.id), a.agent.patch(`/v1/users/${delegado.id}`).send({ group_id: rA2.team, confirm_unassign: true })]);
      expect([200, 409]).toContain(x.status);
      expect([200, 409]).toContain(y.status);
      if (x.status === 409) expect(x.body.error.code).toBe('EXECUTOR_NOT_IN_TEAM');
      const filas = await Promise.all(cs.map(asignacion));
      if ((await fila(delegado.id)).group_id === rA2.team) for (const f of filas) expect(f?.executor_id).toBeNull();
      const entradas = await rastros(desde, cs);
      const cambios = entradas.filter((e) => e.before_state.executor_id !== e.after_state.executor_id).length;
      expect(entradas.length).toBe(cambios); // ninguna entrada sin cambio
    }
  });

  for (const quien of ['dueño', 'ejecutor'] as const) {
    it(`12 rondas: asignar un ${quien} a la vez que se desactiva a esa persona; nunca queda asignado a alguien inactivo`, async () => {
      const persona = quien === 'dueño' ? await activo('responsable') : await activo('delegado', rA.team);
      const cs = controles.slice(0, 3);
      for (let i = 0; i < 12; i++) {
        await owner(`update platform.users set status = 'active' where id = $1`, [persona.id]);
        for (const c of cs) await asignarControl(a.companyId, c, rA.id);
        if (quien === 'dueño') await owner('delete from platform.client_control_assignments where company_id = $1', [a.companyId]);
        const [x, y] = await Promise.all([quien === 'dueño' ? putOwner(cs, persona.id) : putExecutor(cs, persona.id), baja(persona.id)]);
        expect([200, 409]).toContain(x.status);
        expect(y.status).toBe(200);
        const filas = await owner<{ owner_id: string; executor_id: string | null }>('select owner_id, executor_id from platform.client_control_assignments where owner_id = $1 or executor_id = $1', [persona.id]);
        expect(filas).toEqual([]);
        expect((await fila(persona.id)).status).toBe('inactive');
      }
    });
  }
});
