import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { FileStorage } from '../../src/common/storage/file-storage';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { Agent, bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { asignarControl, controlesDe } from '../support/asignaciones';
import { controlPropioConPruebas } from '../support/controles';
import { dosEmpresas, servicePayload, Tenant } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-195 · D122 · «Mi trabajo» (`GET /v1/me/work`) y la carga de trabajo (`GET /v1/team/workload`), por HTTP real contra el Postgres desechable. Cada control cae en UN bucket, el primero que le
// aplique visto desde quien pregunta: rejected → to_review (solo el dueño) → to_upload → in_review → done.
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let adminId: string;
let r1: { id: string; session: Agent }; // dueño de casi todo
let r2: { id: string; session: Agent }; // otro responsable con un solo control
let d1: { id: string; session: Agent }; // ejecutor de varios controles de r1
let d2: { id: string; session: Agent }; // delegado sin controles
let auditor: Agent;
let rB: { id: string; session: Agent };
let servicio2: string;
let c: Record<'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c7' | 'c8' | 'c9' | 'm' | 's2' | 'b1', string>;
let manualTest: string;
let observacionAbierta: string;
const storage = new StorageEnMemoria();
let n = 0;

const pdf = (marca: string) => Buffer.from(`%PDF-1.7\n% trabajo ${marca} ${RUN}\n`);
const ALL_OK = { type_ok: true, period_ok: true, valid_ok: true, approved_ok: true, signed_ok: true, content_ok: true, review: 'human_validated' as const };
const subir = async (agent: Agent, controlId: string, testId: string, marca: string): Promise<string> =>
  (await agent.post(`/v1/controls/${controlId}/tests/${testId}/evidence`).attach('file', pdf(marca), `${marca}.pdf`).expect(201)).body.data.id;
const revisar = (agent: Agent, submissionId: string, body: Record<string, unknown> = ALL_OK) => agent.put(`/v1/evidence-submissions/${submissionId}/review`).send(body);
const rechazar = (agent: Agent, submissionId: string) => revisar(agent, submissionId, { ...ALL_OK, approved_ok: false, note: 'Falta la firma de la dirección.' }).expect(200);
const docTests = (controlId: string) =>
  owner<{ id: string }>(`select t.id from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = $1 and t.dimension = 'policy' order by t.code`, [controlId]).then((r) => r.map((t) => t.id));

const trabajo = async (agent: Agent, query = '') => (await agent.get(`/v1/me/work${query ? `?${query}` : ''}`).expect(200)).body.data;
const de = async (agent: Agent, controlId: string) => {
  const items = (await trabajo(agent, 'page_size=100')).items as any[];
  return items.find((i) => i.client_control_id === controlId);
};
const carga = async (agent: Agent = a.agent) => (await agent.get('/v1/team/workload').expect(200)).body.data;

async function cuenta(companyId: string, role: 'auditor' | 'responsable' | 'delegado', name: string, status = 'active'): Promise<{ id: string; email: string }> {
  const email = `${role}-${name.toLowerCase()}-${RUN}-${n++}@trabajo.test`;
  const [row] = await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role, status, is_internal) values (gen_random_uuid(), $1, $2, $3, 'Prueba', $4, $5::platform.user_role, $6::platform.user_status, $7) returning id`,
    [companyId, email, name, await bcrypt.hash(PASSWORD, 4), role, status, role === 'delegado' ? true : null],
  );
  return { id: row.id, email };
}
const sesion = async (companyId: string, role: 'responsable' | 'delegado', name: string) => {
  const u = await cuenta(companyId, role, name);
  return { id: u.id, session: await login(app, u.email) };
};
/**
 * Controles del servicio con solo pruebas documentales, con ese número de pruebas. En la v2 todo control del catálogo lleva además pruebas operativas, así que se
 * crean controles propios (D79) con las T-DOC pedidas.
 */
let pruebasDoc: string[] = [];
let propios = 0;
const soloDocumentales = async (companyId: string, serviceId: string, docs: number, cantidad: number): Promise<string[]> => {
  if (!pruebasDoc.length) pruebasDoc = (await owner<{ id: string }>(`select id from catalog.tests where code like 'T-DOC-%' order by code limit 12`)).map((r) => r.id);
  const out: string[] = [];
  for (let i = 0; i < cantidad; i++) out.push(await controlPropioConPruebas(companyId, serviceId, `T${RUN.toUpperCase()}${propios++}`, pruebasDoc.slice(i, i + docs)));
  return out;
};

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  ({ a, b, monkey } = await dosEmpresas(app));
  adminId = (await owner<{ id: string }>(`update platform.users set name = 'Camilo', last_name = 'Ortiz' where email = $1 returning id`, [a.email]))[0].id;
  r1 = await sesion(a.companyId, 'responsable', 'Ana');
  r2 = await sesion(a.companyId, 'responsable', 'Zoe');
  d1 = await sesion(a.companyId, 'delegado', 'Beto');
  d2 = await sesion(a.companyId, 'delegado', 'Carla');
  await cuenta(a.companyId, 'responsable', 'Baja', 'inactive');
  auditor = await login(app, (await cuenta(a.companyId, 'auditor', 'Aud')).email);
  rB = await sesion(b.companyId, 'responsable', 'Bruno');

  servicio2 = (await a.agent.post('/v1/services').send(servicePayload(`Otro servicio ${RUN}`)).expect(201)).body.data.id;
  const uno = await soloDocumentales(a.companyId, a.serviceId, 1, 7);
  const dos = await soloDocumentales(a.companyId, a.serviceId, 2, 1);
  const manual = await owner<{ control: string; test: string }>(
    `select cc.id control, x.test_id test from tenant.client_controls cc
       join tenant.client_control_dimensions d on d.client_control_id = cc.id and d.dimension = 'cloud' and d.type = 'manual'
       join tenant.client_control_tests x on x.client_control_id = cc.id join catalog.tests t on t.id = x.test_id and t.dimension = 'cloud'
      where cc.service_id = $1 and cc.is_active and t.primary_source not in ('manual', 'document') order by cc.own_code, t.code`,
    [a.serviceId],
  );
  expect(manual.length).toBeGreaterThan(0);
  manualTest = manual[0].test;
  const s2 = (await soloDocumentales(a.companyId, servicio2, 1, 1))[0];
  c = { c1: uno[0], c2: uno[1], c3: uno[2], c4: uno[3], c5: dos[0], c7: uno[4], c8: uno[5], c9: uno[6], m: manual[0].control, s2, b1: (await controlesDe(b.serviceId))[0] };

  for (const k of ['c1', 'c2', 'c3', 'c5', 'm', 's2'] as const) await asignarControl(a.companyId, c[k], r1.id, d1.id);
  for (const k of ['c4', 'c7'] as const) await asignarControl(a.companyId, c[k], r1.id);
  await asignarControl(a.companyId, c.c8, r2.id);
  await asignarControl(a.companyId, c.c9, adminId);
  await asignarControl(b.companyId, c.b1, rB.id);
});
afterAll(async () => {
  await app?.close();
});

describe('permisos', () => {
  it('sin sesión, 401; «Mi trabajo» no es del admin_empresa, el auditor ni admin_monkey (403)', async () => {
    expect((await request(app.getHttpServer()).get('/v1/me/work')).status).toBe(401);
    expect((await request(app.getHttpServer()).get('/v1/team/workload')).status).toBe(401);
    for (const agent of [a.agent, auditor, monkey]) {
      const res = await agent.get('/v1/me/work').expect(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    }
  });

  it('la carga de trabajo es solo del admin_empresa: responsable, delegado, auditor y admin_monkey reciben 403', async () => {
    for (const agent of [r1.session, d1.session, auditor, monkey]) await agent.get('/v1/team/workload').expect(403);
  });

  it('los parámetros inválidos son 422', async () => {
    await r1.session.get('/v1/me/work?bucket=otro').expect(422);
    await r1.session.get('/v1/me/work?service_id=no-uuid').expect(422);
    await r1.session.get('/v1/me/work?page_size=101').expect(422);
  });
});

describe('sin controles', () => {
  it('quien no tiene controles recibe la lista vacía y el avance sin medir, no un error', async () => {
    const d = await trabajo(d2.session);
    expect(d).toMatchObject({ items: [], total: 0, total_pages: 0, progress: { readiness: 'not_measured', progress: { done: 0, total: 0 }, coverage: { measured: 0, applicable: 0 } } });
  });
});

describe('los buckets (D122)', () => {
  it('sin nada entregado, todo es «por subir»; el dueño y el ejecutor ven su rol y lo que falta', async () => {
    const mine = (await trabajo(r1.session, 'page_size=100')).items as any[];
    expect(mine.map((i) => i.client_control_id).sort()).toEqual([c.c1, c.c2, c.c3, c.c4, c.c5, c.c7, c.m, c.s2].sort());
    for (const i of mine) expect(i).toMatchObject({ bucket: 'to_upload', role_in_control: 'owner' });
    expect(mine.find((i) => i.client_control_id === c.c1)).toMatchObject({ pending_items: 1, service: { name: a.serviceName } });
    expect(mine.find((i) => i.client_control_id === c.c5).pending_items).toBe(2);
    expect(mine.find((i) => i.client_control_id === c.s2).service.id).toBe(servicio2);
    const mios = (await trabajo(d1.session, 'page_size=100')).items as any[];
    expect(mios.map((i) => i.client_control_id).sort()).toEqual([c.c1, c.c2, c.c3, c.c5, c.m, c.s2].sort());
    for (const i of mios) expect(i).toMatchObject({ bucket: 'to_upload', role_in_control: 'executor' });
    expect(Object.keys(mios[0]).sort()).toEqual(['bucket', 'client_control_id', 'code', 'pending_items', 'role_in_control', 'service', 'state', 'title']);
  });

  it('lo que sube el ejecutor está «en revisión» para él y «por revisar» solo para el dueño', async () => {
    await subir(d1.session, c.c1, (await docTests(c.c1))[0], 'c1');
    expect(await de(d1.session, c.c1)).toMatchObject({ bucket: 'in_review', pending_items: 0 });
    expect(await de(r1.session, c.c1)).toMatchObject({ bucket: 'to_review', pending_items: 1 });
    expect((await trabajo(r1.session, 'bucket=to_review')).items.map((i: any) => i.client_control_id)).toEqual([c.c1]);
    expect((await trabajo(d1.session, 'bucket=to_review')).total).toBe(0); // el delegado nunca revisa
  });

  it('lo que sube el dueño espera a otra persona: «en revisión», no «por revisar»; al validarlo el admin_empresa queda «listo»', async () => {
    const id = await subir(r1.session, c.c4, (await docTests(c.c4))[0], 'c4');
    expect(await de(r1.session, c.c4)).toMatchObject({ bucket: 'in_review', pending_items: 0 });
    await revisar(a.agent, id).expect(200);
    expect(await de(r1.session, c.c4)).toMatchObject({ bucket: 'done', pending_items: 0, state: 'effective' });
  });

  it('el dueño valida lo del ejecutor: el control queda «listo» para los dos', async () => {
    const id = (await owner<{ id: string }>(`select s.id from tenant.evidence_submissions s join tenant.evidence_requirements r on r.id = s.evidence_requirement_id where r.client_control_id = $1`, [c.c1]))[0].id;
    await revisar(r1.session, id).expect(200);
    expect(await de(r1.session, c.c1)).toMatchObject({ bucket: 'done', pending_items: 0, state: 'effective' });
    expect(await de(d1.session, c.c1)).toMatchObject({ bucket: 'done', pending_items: 0 });
  });

  it('rechazado: lo que subió el ejecutor y el dueño rechazó es «rechazado» para el ejecutor y para su dueño', async () => {
    const id = await subir(d1.session, c.c2, (await docTests(c.c2))[0], 'c2');
    await rechazar(r1.session, id);
    expect(await de(d1.session, c.c2)).toMatchObject({ bucket: 'rejected', pending_items: 1 });
    expect(await de(r1.session, c.c2)).toMatchObject({ bucket: 'rejected', pending_items: 1 });
    expect((await trabajo(r1.session, 'bucket=rejected')).items.map((i: any) => i.client_control_id)).toEqual([c.c2]);
  });

  it('una observación abierta del auditor cuenta como pendiente; al responderla deja de contar', async () => {
    const antes = (await de(r1.session, c.c3)).pending_items;
    observacionAbierta = (await auditor.post(`/v1/services/${a.serviceId}/observations`).send({ type: 'observation', body: 'Falta el procedimiento de baja.', client_control_id: c.c3 }).expect(201)).body.data.id;
    expect(await de(r1.session, c.c3)).toMatchObject({ bucket: 'to_upload', pending_items: antes + 1 });
    expect(await de(d1.session, c.c3)).toMatchObject({ pending_items: antes + 1 });
    await d1.session.post(`/v1/observations/${observacionAbierta}/answer`).send({ answer_note: 'Se publicó el procedimiento.' }).expect(200);
    expect((await de(r1.session, c.c3)).pending_items).toBe(antes);
  });

  it('cuando aplican varios, gana el primero: «por revisar» antes que «por subir», y «rechazado» antes que los dos', async () => {
    const [tA, tB] = await docTests(c.c5);
    const a1 = await subir(d1.session, c.c5, tA, 'c5a');
    expect(await de(r1.session, c.c5)).toMatchObject({ bucket: 'to_review', pending_items: 2 }); // una por revisar y otra por subir
    expect(await de(d1.session, c.c5)).toMatchObject({ bucket: 'to_upload', pending_items: 1 });
    await subir(d1.session, c.c5, tB, 'c5b');
    await rechazar(r1.session, a1);
    expect(await de(r1.session, c.c5)).toMatchObject({ bucket: 'rejected', pending_items: 2 }); // una rechazada y otra por revisar
    expect(await de(d1.session, c.c5)).toMatchObject({ bucket: 'rejected', pending_items: 1 });
  });

  it('un veredicto manual se trata como una pieza más: lo registra el ejecutor, lo revisa el dueño y un rechazo lo devuelve', async () => {
    expect(await de(r1.session, c.m)).toMatchObject({ bucket: 'to_upload' });
    const v = (await d1.session.post(`/v1/controls/${c.m}/tests/${manualTest}/verdicts`).send({ result: 'compliant' }).expect(201)).body.data.id;
    expect(await de(r1.session, c.m)).toMatchObject({ bucket: 'to_review' });
    expect((await de(d1.session, c.m)).bucket).toBe('to_upload'); // al ejecutor le sigue faltando alguna pieza
    await r1.session.put(`/v1/verdicts/${v}/review`).send({ decision: 'reject', note: 'No coincide con la consola.' }).expect(200);
    expect(await de(r1.session, c.m)).toMatchObject({ bucket: 'rejected' });
    expect(await de(d1.session, c.m)).toMatchObject({ bucket: 'rejected' });
  });

  it('la lista sale en el orden de los buckets, y el avance es el objeto del marco: semáforo, hechos y cobertura', async () => {
    const d = await trabajo(r1.session, 'page_size=100');
    const orden = ['rejected', 'to_review', 'to_upload', 'in_review', 'done'];
    const idx = d.items.map((i: any) => orden.indexOf(i.bucket));
    expect(idx).toEqual([...idx].sort((x, y) => x - y));
    const items = d.items as any[];
    const hechos = items.filter((i) => i.state === 'effective').length;
    const medidos = items.filter((i) => ['effective', 'ineffective', 'expired'].includes(i.state)).length;
    expect(d.progress).toEqual({ readiness: expect.stringMatching(/^(ready|almost_ready|needs_work|not_measured)$/), progress: { done: hechos, total: 8 }, coverage: { measured: medidos, applicable: 8 } });
    expect(d.progress).toMatchObject({ progress: { done: 2 }, readiness: 'needs_work' }); // c1 y c4
    expect(d.progress).not.toHaveProperty('percent');
  });
});

describe('filtros y paginación', () => {
  it('service_id limita la lista y el avance a ese servicio', async () => {
    const d = await trabajo(r1.session, `service_id=${servicio2}`);
    expect(d.items.map((i: any) => i.client_control_id)).toEqual([c.s2]);
    expect(d.progress.progress.total).toBe(1);
    const otro = await trabajo(r1.session, `service_id=${a.serviceId}`);
    expect(otro.total).toBe(7);
    expect(otro.progress.progress.total).toBe(7);
  });

  it('un servicio de otra empresa o sin controles suyos no devuelve nada', async () => {
    expect((await trabajo(r1.session, `service_id=${b.serviceId}`)).items).toEqual([]);
    expect((await trabajo(d2.session, `service_id=${a.serviceId}`)).items).toEqual([]);
  });

  it('q busca en el código y en el título, sin distinguir mayúsculas ni acentos; los filtros se combinan y no mueven el avance', async () => {
    const todos = (await trabajo(r1.session, 'page_size=100')).items as any[];
    const uno = todos.find((i) => i.client_control_id === c.c5);
    const porCodigo = (await trabajo(r1.session, `q=${encodeURIComponent(uno.code.toUpperCase())}&page_size=100`)).items as any[];
    expect(porCodigo.map((i) => i.client_control_id)).toContain(c.c5);
    const frase = uno.title.normalize('NFD').replace(/\p{M}/gu, '').slice(0, 12).toUpperCase();
    const porTitulo = await trabajo(r1.session, `q=${encodeURIComponent(frase)}&bucket=rejected`);
    expect(porTitulo.items.every((i: any) => i.bucket === 'rejected')).toBe(true);
    expect(porTitulo.items.map((i: any) => i.client_control_id)).toContain(c.c5);
    expect(porTitulo.progress.progress.total).toBe(8);
    expect((await trabajo(r1.session, 'q=zzzz-no-existe')).items).toEqual([]);
  });

  it('pagina: page_size y total_pages', async () => {
    const p1 = await trabajo(r1.session, 'page=1&page_size=3');
    const p3 = await trabajo(r1.session, 'page=3&page_size=3');
    expect(p1).toMatchObject({ page: 1, page_size: 3, total: 8, total_pages: 3 });
    expect(p1.items).toHaveLength(3);
    expect(p3.items).toHaveLength(2);
  });
});

describe('cada persona ve solo lo suyo', () => {
  it('otro responsable solo ve sus controles; el responsable de otra empresa no ve nada de ésta', async () => {
    expect((await trabajo(r2.session)).items.map((i: any) => i.client_control_id)).toEqual([c.c8]);
    expect((await trabajo(rB.session)).items.map((i: any) => i.client_control_id)).toEqual([c.b1]);
  });

  it('una persona dada de baja deja de ver el control (D102)', async () => {
    const temp = await sesion(a.companyId, 'delegado', 'Temporal');
    await asignarControl(a.companyId, c.c7, r1.id, temp.id);
    expect((await trabajo(temp.session)).total).toBe(1);
    await owner(`update platform.users set status = 'inactive' where id = $1`, [temp.id]);
    await asignarControl(a.companyId, c.c7, r1.id, null);
  });
});

describe('carga de trabajo', () => {
  it('lista a cada responsable y delegado activo (también con cero) y al admin dueño de un control, por rol y nombre', async () => {
    const d = await carga();
    expect(d.items.map((i: any) => [i.user.role, i.user.name, i.owned_count, i.executed_count])).toEqual([
      ['responsable', 'Ana', 8, 0],
      ['responsable', 'Zoe', 1, 0],
      ['delegado', 'Beto', 0, 6],
      ['delegado', 'Carla', 0, 0],
      ['admin_empresa', 'Camilo', 1, 0],
    ]);
    expect(d.items[0].user).toEqual({ id: r1.id, name: 'Ana', last_name: 'Prueba', role: 'responsable' });
    expect(JSON.stringify(d)).not.toContain('Baja'); // la persona dada de baja no sale
  });

  it('«Sin asignar» cuenta los controles vigentes sin dueño de toda la empresa', async () => {
    const [{ n: total }] = await owner<{ n: number }>(`select count(*)::int n from tenant.client_controls where service_id = any($1::uuid[]) and is_active`, [[a.serviceId, servicio2]]);
    expect((await carga()).unassigned_count).toBe(total - 10);
  });

  it('el avance de cada persona es el mismo objeto que «Mi trabajo» (dueño ∪ ejecutor), con la cobertura al lado', async () => {
    const d = await carga();
    const por = (id: string) => d.items.find((i: any) => i.user.id === id);
    expect(por(r1.id).progress).toEqual((await trabajo(r1.session)).progress);
    expect(por(d1.id).progress).toEqual((await trabajo(d1.session)).progress);
    expect(por(d2.id).progress).toEqual({ readiness: 'not_measured', progress: { done: 0, total: 0 }, coverage: { measured: 0, applicable: 0 } });
    expect(por(d1.id).progress.progress.total).toBe(6);
    expect(por(r1.id).progress).not.toHaveProperty('percent');
  });

  it('cada empresa ve solo su gente', async () => {
    const d = await carga(b.agent);
    expect(d.items.map((i: any) => i.user.id)).toEqual([rB.id]);
    expect(d.items[0]).toMatchObject({ owned_count: 1, executed_count: 0 });
  });

  it('un número fijo de consultas: no crece con las personas ni los controles', async () => {
    const withScope = jest.spyOn(app.get(PrismaService), 'withScope');
    await carga();
    const conMuchos = withScope.mock.calls.length;
    withScope.mockClear();
    await trabajo(r1.session, 'page_size=100');
    const mias = withScope.mock.calls.length;
    withScope.mockRestore();
    expect(conMuchos).toBeLessThanOrEqual(4);
    expect(mias).toBeLessThanOrEqual(4);
  });
});

// MD-499 · De qué cuenta cada prueba lo decide la regla de la subida (fuente principal y dimensión aplicable), no el tipo de la dimensión: una prueba `process` manual de una dimensión
// híbrida es una pieza de evidencia; el veredicto (D85) queda para la manual que no acepta subida (la prueba de nube de arriba).
describe('una prueba de proceso cuenta como evidencia (MD-499)', () => {
  it('una prueba `process` manual en una dimensión híbrida es una pieza por subir; al subirla pasa a revisión y la valida el dueño', async () => {
    const [test] = await owner<{ id: string }>(`select id from catalog.tests where dimension = 'process' and primary_source = 'manual' order by code limit 1`);
    const control = await controlPropioConPruebas(a.companyId, a.serviceId, `W${RUN.toUpperCase()}`, [test.id], 'process', 'hybrid');
    await asignarControl(a.companyId, control, r1.id, d1.id);
    expect(await de(r1.session, control)).toMatchObject({ bucket: 'to_upload', pending_items: 1 });
    const id = await subir(d1.session, control, test.id, 'proceso');
    expect(await de(r1.session, control)).toMatchObject({ bucket: 'to_review' });
    expect(await de(d1.session, control)).toMatchObject({ bucket: 'in_review' });
    await revisar(r1.session, id).expect(200);
    expect(await de(r1.session, control)).toMatchObject({ bucket: 'done' });
  });

  it('la misma prueba con la dimensión «no aplica» no es pieza: el control no tiene nada pendiente', async () => {
    const [test] = await owner<{ id: string }>(`select id from catalog.tests where dimension = 'process' and primary_source = 'manual' order by code offset 1 limit 1`);
    const control = await controlPropioConPruebas(a.companyId, a.serviceId, `X${RUN.toUpperCase()}`, [test.id], 'process', 'manual');
    await owner(`update tenant.client_control_dimensions set reason_not_applicable = 'No aplica' where client_control_id = $1 and dimension = 'process'::catalog.dimension`, [control]);
    await asignarControl(a.companyId, control, r1.id, d1.id);
    expect(await de(r1.session, control)).toMatchObject({ pending_items: 0 });
  });
});
