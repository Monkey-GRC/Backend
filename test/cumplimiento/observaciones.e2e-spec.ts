import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { FileStorage } from '../../src/common/storage/file-storage';
import { PurgeExpiredCompaniesUseCase } from '../../src/features/companies/application/use-cases/purge-expired-companies.use-case';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { asApp, connect, failure } from '../support/db';
import { dosEmpresas, servicePayload, Tenant } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-154 · Las observaciones del auditor (contracts/modules/compliance-audit.md, SEG-69 y SEG-70): las escribe y cierra solo el `auditor` y solo las suyas, las responde el `admin_empresa` o el
// `funcional` responsable del control, no mueven el porcentaje, nunca se borran y una cerrada no se toca (lo impone la base, no solo la API). Cada prueba sale por HTTP con la
// sesión real de cada rol, contra el Postgres desechable.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent; // quien escribe en A
let auditor2: Agent; // otro auditor de A: ve todo, pero no toca lo del primero
let auditorB: Agent;
let funcional: Agent; // responsable de `control1`
let funcionalAjeno: Agent; // de A, sin ningún control
let adminId: string;
let auditorId: string;
let funcionalId: string;
let control1: string;
let control2: string; // de un control del que el funcional NO es responsable
let submission1: string; // entrega de evidencia del control 1
let submission2: string; // entrega de evidencia del control 2
let submissionB: string; // una entrega de la OTRA empresa
const storage = new StorageEnMemoria();

const realInsert = auditInsert.insertAuditLog;
const auditFailsAfterInsert = () =>
  jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
    await realInsert(db, entry);
    throw new Error('audit_down');
  });
afterEach(() => jest.restoreAllMocks());

const pdf = (marca: string) => Buffer.from(`%PDF-1.7\n% evidencia ${marca} ${RUN}\n`);
const auditRows = (action: string, tenant = a.companyId) => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [tenant, action]).then((r) => r[0].n);
const row = (id: string) => owner<Record<string, any>>('select * from tenant.audit_observations where id = $1', [id]).then((r) => r[0]);

async function cuenta(companyId: string, email: string, role: 'auditor' | 'funcional'): Promise<string> {
  return (await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, $2, 'Camilo', 'Ortiz', $3, $4::platform.user_role) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  ))[0].id;
}
const assign = (companyId: string, userId: string, control: string, assignedBy: string) =>
  owner(`insert into platform.user_control_assignments (id, company_id, user_id, client_control_id, dimension, assigned_by) select gen_random_uuid(), $1, $2, $3::uuid, d.dimension, $4 from (select distinct t.dimension from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = $3::uuid) d`, [companyId, userId, control, assignedBy]);

const create = (agent: Agent, serviceId: string, body: Record<string, unknown>) => agent.post(`/v1/services/${serviceId}/observations`).send(body);
const base = { type: 'observation', body: 'Falta el procedimiento de baja de cuentas de contratistas.' };
const make = async (over: Record<string, unknown> = {}, who: Agent = auditor, serviceId = a.serviceId): Promise<any> => (await create(who, serviceId, { ...base, ...over }).expect(201)).body.data;
const answer = (agent: Agent, id: string, body: Record<string, unknown> = { answer_note: 'Se documentó el procedimiento y se publicó.' }) => agent.post(`/v1/observations/${id}/answer`).send(body);
const patch = (agent: Agent, id: string, body: Record<string, unknown>) => agent.patch(`/v1/observations/${id}`).send(body);
const code = (res: { body: any }) => res.body.error?.code;
const fieldCodes = (res: { body: any }) => (res.body.error?.fields ?? []).map((f: any) => `${f.field}:${f.code}`);
/** Una observación ya respondida (lista para cerrar o devolver). */
const answered = async (over: Record<string, unknown> = {}) => {
  const o = await make(over);
  await answer(a.agent, o.id).expect(200);
  return o;
};

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  ({ a, b, monkey } = await dosEmpresas(app));
  adminId = (await owner<{ id: string }>(`select id from platform.users where email = $1`, [a.email]))[0].id;
  auditorId = await cuenta(a.companyId, `auditor-obs-${RUN}@cumplimiento.test`, 'auditor');
  await cuenta(a.companyId, `auditor2-obs-${RUN}@cumplimiento.test`, 'auditor');
  await cuenta(b.companyId, `auditor-obs-b-${RUN}@cumplimiento.test`, 'auditor');
  funcionalId = await cuenta(a.companyId, `funcional-obs-${RUN}@cumplimiento.test`, 'funcional');
  await cuenta(a.companyId, `funcional2-obs-${RUN}@cumplimiento.test`, 'funcional');
  auditor = await login(app, `auditor-obs-${RUN}@cumplimiento.test`);
  auditor2 = await login(app, `auditor2-obs-${RUN}@cumplimiento.test`);
  auditorB = await login(app, `auditor-obs-b-${RUN}@cumplimiento.test`);
  funcional = await login(app, `funcional-obs-${RUN}@cumplimiento.test`);
  funcionalAjeno = await login(app, `funcional2-obs-${RUN}@cumplimiento.test`);

  // Dos controles del servicio de A con evidencia requerida: el primero es del funcional; el segundo no. Cada uno con una entrega de evidencia.
  const reqs = await owner<{ id: string; client_control_id: string }>(
    `select distinct on (er.client_control_id) er.id, er.client_control_id from tenant.evidence_requirements er join tenant.client_controls cc on cc.id = er.client_control_id
      where cc.service_id = $1 and cc.is_active order by er.client_control_id, er.sequence limit 2`,
    [a.serviceId],
  );
  expect(reqs.length).toBe(2);
  [control1, control2] = reqs.map((r) => r.client_control_id);
  await assign(a.companyId, funcionalId, control1, adminId);
  const up = async (req: string, marca: string) => (await a.agent.post(`/v1/evidence-requirements/${req}/submissions`).attach('file', pdf(marca), 'evidencia.pdf').expect(201)).body.data.id as string;
  submission1 = await up(reqs[0].id, '1');
  submission2 = await up(reqs[1].id, '2');
  const [reqB] = await owner<{ id: string }>(`select er.id from tenant.evidence_requirements er join tenant.client_controls cc on cc.id = er.client_control_id where cc.service_id = $1 and cc.is_active order by er.sequence limit 1`, [b.serviceId]);
  submissionB = (await b.agent.post(`/v1/evidence-requirements/${reqB.id}/submissions`).attach('file', pdf('b'), 'evidencia.pdf').expect(201)).body.data.id;
});
afterAll(async () => {
  await app?.close();
});

describe('quién puede escribir', () => {
  it('el auditor registra una observación: nace abierta, con su autor, y la empresa ya la ve', async () => {
    const before = await auditRows('observation.create');
    const res = await create(auditor, a.serviceId, { ...base, type: 'recommendation', client_control_id: control1 }).expect(201);
    expect(res.body.message).toBeDefined();
    expect(res.body.data).toMatchObject({
      service_id: a.serviceId, client_control_id: control1, evidence_submission_id: null, type: 'recommendation', body: base.body, status: 'open',
      created_by: { id: auditorId, name: 'Camilo', last_name: 'Ortiz', role: 'auditor' },
      answer_note: null, answer_evidence_id: null, answered_by: null, answered_at: null, closed_by: null, closed_at: null,
    });
    expect(await auditRows('observation.create')).toBe(before + 1);
    const seen = (await a.agent.get(`/v1/services/${a.serviceId}/observations`).expect(200)).body.data.items.map((o: any) => o.id);
    expect(seen).toContain(res.body.data.id);
  });

  it.each([['admin_empresa'], ['funcional'], ['admin_monkey']])('un %s no registra: 403 y no queda nada', async (who) => {
    const agent = who === 'admin_empresa' ? a.agent : who === 'funcional' ? funcional : monkey;
    const before = (await owner<{ n: number }>('select count(*)::int n from tenant.audit_observations where tenant_id = $1', [a.companyId]))[0].n;
    const res = await create(agent, a.serviceId, base);
    expect(res.status).toBe(403);
    expect(code(res)).toBe('FORBIDDEN');
    expect((await owner<{ n: number }>('select count(*)::int n from tenant.audit_observations where tenant_id = $1', [a.companyId]))[0].n).toBe(before);
  });

  it('sin sesión: 401', async () => {
    expect((await request(app.getHttpServer()).post(`/v1/services/${a.serviceId}/observations`).send(base)).status).toBe(401);
  });
});

describe('sobre qué habla', () => {
  it('de un servicio completo, de un control, de una evidencia, o de un control y su evidencia', async () => {
    expect(await make()).toMatchObject({ client_control_id: null, evidence_submission_id: null });
    expect(await make({ client_control_id: control1 })).toMatchObject({ client_control_id: control1, evidence_submission_id: null });
    expect(await make({ client_control_id: control1, evidence_submission_id: submission1 })).toMatchObject({ client_control_id: control1, evidence_submission_id: submission1 });
  });

  it('si solo manda la evidencia, queda también en el control de esa evidencia (así la ve su responsable)', async () => {
    const o = await make({ evidence_submission_id: submission1 });
    expect(o).toMatchObject({ client_control_id: control1, evidence_submission_id: submission1 });
    expect((await funcional.get(`/v1/observations/${o.id}`).expect(200)).body.data.id).toBe(o.id);
  });

  it('con control y evidencia de otro control: 422', async () => {
    const res = await create(auditor, a.serviceId, { ...base, client_control_id: control1, evidence_submission_id: submission2 });
    expect(res.status).toBe(422);
    expect(fieldCodes(res)).toContain('evidence_submission_id:control.mismatch');
  });

  it('un control o una evidencia que no existen, o que son de otra empresa, o un servicio ajeno: 404', async () => {
    expect((await create(auditor, a.serviceId, { ...base, client_control_id: randomUUID() })).status).toBe(404);
    expect((await create(auditor, a.serviceId, { ...base, evidence_submission_id: randomUUID() })).status).toBe(404);
    const [{ id: controlB }] = await owner<{ id: string }>('select id from tenant.client_controls where service_id = $1 limit 1', [b.serviceId]);
    expect((await create(auditor, a.serviceId, { ...base, client_control_id: controlB })).status).toBe(404);
    expect((await create(auditor, b.serviceId, base)).status).toBe(404);
    expect((await create(auditor, randomUUID(), base)).status).toBe(404);
  });

  it('sobre un control dado de baja no se abren observaciones nuevas (409), pero las que ya tenía se siguen leyendo', async () => {
    const [{ id: retired }] = await owner<{ id: string }>(`select id from tenant.client_controls where service_id = $1 and is_active and id not in ($2, $3) limit 1`, [a.serviceId, control1, control2]);
    const existing = await make({ client_control_id: retired });
    await owner('update tenant.client_controls set is_active = false where id = $1', [retired]);
    try {
      const res = await create(auditor, a.serviceId, { ...base, client_control_id: retired });
      expect(res.status).toBe(409);
      expect(code(res)).toBe('CONTROL_RETIRED');
      expect((await auditor.get(`/v1/observations/${existing.id}`).expect(200)).body.data.id).toBe(existing.id);
    } finally {
      await owner('update tenant.client_controls set is_active = true where id = $1', [retired]);
    }
  });

  it('valida los campos: tipo, texto vacío o en blanco, texto muy largo, ids que no son uuid', async () => {
    expect(fieldCodes(await create(auditor, a.serviceId, { ...base, type: 'hallazgo' }))).toContain('type:enum.invalid');
    expect(fieldCodes(await create(auditor, a.serviceId, { ...base, body: '' }))).toContain('body:required');
    const blank = await create(auditor, a.serviceId, { ...base, body: '    ' });
    expect(blank.status).toBe(422);
    expect(fieldCodes(blank)).toContain('body:required');
    expect(fieldCodes(await create(auditor, a.serviceId, { ...base, body: 'x'.repeat(5001) }))).toContain('body:string.max');
    expect(fieldCodes(await create(auditor, a.serviceId, { ...base, client_control_id: 'no-es-uuid' }))).toContain('client_control_id:uuid.invalid');
    expect((await create(auditor, a.serviceId, { ...base, body: 'x'.repeat(5000) })).status).toBe(201);
  });
});

describe('quién las ve', () => {
  let serviceWide: any;
  let ofControl1: any;
  let ofControl2: any;

  beforeAll(async () => {
    serviceWide = await make({ body: 'Visibilidad: servicio completo.' });
    ofControl1 = await make({ body: 'Visibilidad: control 1.', client_control_id: control1, type: 'information_request' });
    ofControl2 = await make({ body: 'Visibilidad: control 2.', client_control_id: control2 });
  });
  const ids = async (agent: Agent, query = '') => (await agent.get(`/v1/services/${a.serviceId}/observations?page_size=100${query}`).expect(200)).body.data.items.map((o: any) => o.id) as string[];

  it('el admin_empresa y los auditores ven todas', async () => {
    for (const agent of [a.agent, auditor, auditor2]) expect(await ids(agent)).toEqual(expect.arrayContaining([serviceWide.id, ofControl1.id, ofControl2.id]));
  });

  it('el funcional ve solo las de los controles de los que es responsable: ni las de un servicio completo ni las de otro control', async () => {
    const mine = await ids(funcional);
    expect(mine).toContain(ofControl1.id);
    expect(mine).not.toContain(serviceWide.id);
    expect(mine).not.toContain(ofControl2.id);
  });

  it('un funcional sin controles recibe la lista vacía, no un error', async () => {
    const res = await funcionalAjeno.get(`/v1/services/${a.serviceId}/observations`).expect(200);
    expect(res.body.data).toMatchObject({ items: [], total: 0 });
  });

  it('el detalle: el funcional abre las de su control; las de otro control o de un servicio completo son 403', async () => {
    expect((await funcional.get(`/v1/observations/${ofControl1.id}`).expect(200)).body.data).toMatchObject({ id: ofControl1.id, status: 'open' });
    for (const hidden of [ofControl2, serviceWide]) {
      const res = await funcional.get(`/v1/observations/${hidden.id}`);
      expect(res.status).toBe(403);
      expect(code(res)).toBe('FORBIDDEN');
    }
    expect((await funcionalAjeno.get(`/v1/observations/${ofControl1.id}`)).status).toBe(403);
  });

  it('admin_monkey no entra: 403 en la lista y en el detalle', async () => {
    expect((await monkey.get(`/v1/services/${a.serviceId}/observations`)).status).toBe(403);
    expect((await monkey.get(`/v1/observations/${ofControl1.id}`)).status).toBe(403);
  });

  it('filtra por estado, tipo y control', async () => {
    expect(await ids(auditor, '&type=information_request')).toContain(ofControl1.id);
    expect(await ids(auditor, '&type=information_request')).not.toContain(ofControl2.id);
    expect(await ids(auditor, `&client_control_id=${control2}`)).toContain(ofControl2.id);
    expect(await ids(auditor, `&client_control_id=${control2}`)).not.toContain(ofControl1.id);
    const done = await answered({ body: 'Visibilidad: respondida.' });
    expect(await ids(auditor, '&status=answered')).toContain(done.id);
    expect(await ids(auditor, '&status=open')).not.toContain(done.id);
    // El filtro por control no deja al funcional ver lo que no es suyo.
    expect(await ids(funcional, `&client_control_id=${control2}`)).toEqual([]);
  });

  it('pagina de la más reciente a la más antigua', async () => {
    const page = (await auditor.get(`/v1/services/${a.serviceId}/observations?page=1&page_size=2`).expect(200)).body.data;
    expect(page.items).toHaveLength(2);
    expect(page.page_size).toBe(2);
    expect(page.total_pages).toBe(Math.ceil(page.total / 2));
    const all = (await auditor.get(`/v1/services/${a.serviceId}/observations?page_size=100`).expect(200)).body.data.items.map((o: any) => o.created_at);
    expect([...all].sort().reverse()).toEqual(all);
    expect((await auditor.get(`/v1/services/${a.serviceId}/observations?page_size=101`)).status).toBe(422);
  });

  it('otra empresa no ve nada: un servicio o una observación ajenos son 404', async () => {
    expect((await auditorB.get(`/v1/services/${a.serviceId}/observations`)).status).toBe(404);
    expect((await auditorB.get(`/v1/observations/${ofControl1.id}`)).status).toBe(404);
    expect((await b.agent.get(`/v1/observations/${ofControl1.id}`)).status).toBe(404);
    expect((await auditor.get('/v1/observations/no-es-uuid')).status).toBe(404);
    expect((await auditor.get(`/v1/observations/${randomUUID()}`)).status).toBe(404);
  });
});

describe('responder', () => {
  it('el admin_empresa responde con una nota: pasa a respondida, con quién y cuándo, y deja rastro', async () => {
    const o = await make();
    const before = await auditRows('observation.answer');
    const res = await answer(a.agent, o.id, { answer_note: 'Se documentó el procedimiento.' }).expect(200);
    expect(res.body.data).toMatchObject({ status: 'answered', answer_note: 'Se documentó el procedimiento.', answer_evidence_id: null, answered_by: { id: adminId }, closed_by: null });
    expect(res.body.data.answered_at).toBeTruthy();
    expect(await auditRows('observation.answer')).toBe(before + 1);
  });

  it('puede respaldarla con una evidencia del mismo servicio', async () => {
    const o = await make({ client_control_id: control2 });
    const res = await answer(a.agent, o.id, { answer_note: 'Ver la política vigente.', answer_evidence_id: submission2 }).expect(200);
    expect(res.body.data.answer_evidence_id).toBe(submission2);
  });

  it('una evidencia que no existe o que es de otra empresa: 404, y la observación sigue abierta', async () => {
    const o = await make();
    expect((await answer(a.agent, o.id, { answer_note: 'x', answer_evidence_id: randomUUID() })).status).toBe(404);
    expect((await answer(a.agent, o.id, { answer_note: 'x', answer_evidence_id: submissionB })).status).toBe(404);
    expect((await create(auditor, a.serviceId, { ...base, evidence_submission_id: submissionB })).status).toBe(404);
    expect((await row(o.id)).status).toBe('open');
  });

  it('el funcional responde las de su control; las de otro control o de un servicio completo, no (403)', async () => {
    const mine = await make({ client_control_id: control1 });
    expect((await answer(funcional, mine.id).expect(200)).body.data).toMatchObject({ status: 'answered', answered_by: { id: funcionalId } });
    for (const over of [{ client_control_id: control2 }, {}]) {
      const other = await make(over);
      const res = await answer(funcional, other.id);
      expect(res.status).toBe(403);
      expect((await row(other.id)).status).toBe('open');
    }
    expect((await answer(funcionalAjeno, (await make({ client_control_id: control1 })).id)).status).toBe(403);
  });

  it('el auditor no responde (ni las suyas) y admin_monkey tampoco: 403', async () => {
    const o = await make();
    expect((await answer(auditor, o.id)).status).toBe(403);
    expect((await answer(monkey, o.id)).status).toBe(403);
    expect((await row(o.id)).status).toBe('open');
  });

  it('exige la nota: sin ella o en blanco, 422', async () => {
    const o = await make();
    expect(fieldCodes(await answer(a.agent, o.id, {}))).toContain('answer_note:required');
    expect(fieldCodes(await answer(a.agent, o.id, { answer_note: '   ' }))).toContain('answer_note:required');
    expect(fieldCodes(await answer(a.agent, o.id, { answer_note: 'x'.repeat(2001) }))).toContain('answer_note:string.max');
    expect(fieldCodes(await answer(a.agent, o.id, { answer_note: 'ok', answer_evidence_id: 'no-uuid' }))).toContain('answer_evidence_id:uuid.invalid');
    expect((await row(o.id)).status).toBe('open');
  });

  it('una ya respondida no se responde otra vez (409 OBSERVATION_NOT_OPEN) y la primera respuesta no se pisa', async () => {
    const o = await answered();
    const res = await answer(a.agent, o.id, { answer_note: 'Otra respuesta.' });
    expect(res.status).toBe(409);
    expect(code(res)).toBe('OBSERVATION_NOT_OPEN');
    expect((await row(o.id)).answer_note).toBe('Se documentó el procedimiento y se publicó.');
  });

  it('dos respuestas a la vez: una gana y la otra recibe 409', async () => {
    const o = await make();
    const results = await Promise.all([answer(a.agent, o.id, { answer_note: 'Primera.' }), answer(a.agent, o.id, { answer_note: 'Segunda.' })]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(results.find((r) => r.status === 409)?.body.error.code).toBe('OBSERVATION_NOT_OPEN');
    expect(await owner('select 1 from audit.audit_logs where tenant_id = $1 and action = $2 and after_state->>\'id\' = $3', [a.companyId, 'observation.answer', o.id])).toHaveLength(1);
  });
});

describe('editar, devolver y cerrar: solo su autor', () => {
  it('el autor edita el texto mientras no esté cerrada (abierta o respondida) y queda el antes y el después', async () => {
    const o = await make();
    const res = await patch(auditor, o.id, { body: 'Texto corregido.' }).expect(200);
    expect(res.body.data).toMatchObject({ body: 'Texto corregido.', status: 'open' });
    const [trail] = await owner<{ before_state: any; after_state: any }>(`select before_state, after_state from audit.audit_logs where tenant_id = $1 and action = 'observation.update' and after_state->>'id' = $2`, [a.companyId, o.id]);
    expect(trail.before_state.body).toBe(base.body);
    expect(trail.after_state.body).toBe('Texto corregido.');
    const done = await answered();
    expect((await patch(auditor, done.id, { body: 'Aun respondida se puede ajustar.' }).expect(200)).body.data.status).toBe('answered');
  });

  it('otro auditor de la misma empresa, el admin_empresa y el funcional no la tocan: 403', async () => {
    const o = await answered();
    for (const agent of [auditor2, a.agent, funcional]) {
      for (const body of [{ body: 'Intento.' }, { status: 'closed' }, { status: 'open' }]) {
        const res = await patch(agent, o.id, body);
        expect(res.status).toBe(403);
        expect(code(res)).toBe('FORBIDDEN');
      }
    }
    expect((await row(o.id)).status).toBe('answered');
  });

  it('un PATCH hace una sola cosa: ni vacío ni texto y estado juntos, y el estado solo `open` o `closed`', async () => {
    const o = await answered();
    expect(fieldCodes(await patch(auditor, o.id, {}))).toContain('body:body_or_status.required');
    expect(fieldCodes(await patch(auditor, o.id, { body: 'x', status: 'closed' }))).toContain('status:body_or_status.exclusive');
    expect(fieldCodes(await patch(auditor, o.id, { status: 'answered' }))).toContain('status:enum.invalid');
    expect(fieldCodes(await patch(auditor, o.id, { body: '   ' }))).toContain('body:required');
    expect((await row(o.id)).status).toBe('answered');
  });

  it('cerrar o devolver una abierta (que nadie respondió) es 409 INVALID_TRANSITION', async () => {
    const o = await make();
    for (const status of ['closed', 'open']) {
      const res = await patch(auditor, o.id, { status });
      expect(res.status).toBe(409);
      expect(code(res)).toBe('INVALID_TRANSITION');
    }
    expect((await row(o.id)).status).toBe('open');
  });

  it('devolver una respondida la deja abierta, conserva la última respuesta y la empresa puede responder otra vez', async () => {
    const o = await answered();
    const before = await auditRows('observation.return');
    const res = await patch(auditor, o.id, { status: 'open' }).expect(200);
    expect(res.body.data).toMatchObject({ status: 'open', answer_note: 'Se documentó el procedimiento y se publicó.', closed_by: null, closed_at: null });
    expect(await auditRows('observation.return')).toBe(before + 1);
    const again = await answer(a.agent, o.id, { answer_note: 'Segunda respuesta, con más detalle.' }).expect(200);
    expect(again.body.data).toMatchObject({ status: 'answered', answer_note: 'Segunda respuesta, con más detalle.' });
    // La primera respuesta no se pierde: queda en el rastro (es lo único que la conserva).
    const [trail] = await owner<{ before_state: any }>(`select before_state from audit.audit_logs where tenant_id = $1 and action = 'observation.answer' and after_state->>'id' = $2 order by created_at desc limit 1`, [a.companyId, o.id]);
    expect(trail.before_state.answer_note).toBe('Se documentó el procedimiento y se publicó.');
  });

  it('cerrar una respondida: queda cerrada, por quien la escribió, y deja rastro', async () => {
    const o = await answered();
    const before = await auditRows('observation.close');
    const res = await patch(auditor, o.id, { status: 'closed' }).expect(200);
    expect(res.body.data).toMatchObject({ status: 'closed', closed_by: { id: auditorId } });
    expect(res.body.data.closed_at).toBeTruthy();
    expect(await auditRows('observation.close')).toBe(before + 1);
  });

  it('una cerrada no se modifica ni se reabre ni se responde ni se vuelve a cerrar: 409 OBSERVATION_CLOSED, y la base queda igual', async () => {
    const o = await answered();
    await patch(auditor, o.id, { status: 'closed' }).expect(200);
    const frozen = await row(o.id);
    const attempts = [patch(auditor, o.id, { body: 'Tarde.' }), patch(auditor, o.id, { status: 'open' }), patch(auditor, o.id, { status: 'closed' }), answer(a.agent, o.id, { answer_note: 'Tarde.' })];
    for (const res of await Promise.all(attempts)) {
      expect(res.status).toBe(409);
      expect(code(res)).toBe('OBSERVATION_CLOSED');
    }
    expect(await row(o.id)).toEqual(frozen);
  });

  it('cerrar y devolver a la vez: gana una sola y la otra recibe 409', async () => {
    const o = await answered();
    const results = await Promise.all([patch(auditor, o.id, { status: 'closed' }), patch(auditor, o.id, { status: 'open' })]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(['OBSERVATION_CLOSED', 'INVALID_TRANSITION']).toContain(results.find((r) => r.status === 409)?.body.error.code);
  });
});

describe('no mueven el porcentaje', () => {
  it('registrar, responder, devolver y cerrar no escriben ninguna evaluación ni evento de cumplimiento', async () => {
    const counts = async () => ({
      evaluations: (await owner<{ n: number }>('select count(*)::int n from tenant.evaluations where tenant_id = $1', [a.companyId]))[0].n,
      events: (await owner<{ n: number }>('select count(*)::int n from audit.compliance_events where tenant_id = $1', [a.companyId]))[0].n,
    });
    const overview = async () => (await a.agent.get(`/v1/services/${a.serviceId}/compliance-overview`)).body;
    const before = { counts: await counts(), overview: await overview() };
    const o = await make({ client_control_id: control1, type: 'information_request' });
    await answer(a.agent, o.id).expect(200);
    await patch(auditor, o.id, { status: 'open' }).expect(200);
    await answer(a.agent, o.id, { answer_note: 'De nuevo.' }).expect(200);
    await patch(auditor, o.id, { status: 'closed' }).expect(200);
    expect(await counts()).toEqual(before.counts);
    expect(await overview()).toEqual(before.overview);
  });
});

describe('el rastro es atómico (SEG-36)', () => {
  it('si falla la auditoría al registrar, la observación no queda', async () => {
    const count = async () => (await owner<{ n: number }>('select count(*)::int n from tenant.audit_observations where body = $1', ['Se cae la auditoría.']))[0].n;
    auditFailsAfterInsert();
    expect((await create(auditor, a.serviceId, { ...base, body: 'Se cae la auditoría.' })).status).toBe(500);
    expect(await count()).toBe(0);
  });

  it('si falla la auditoría al responder o al cerrar, el estado no cambia', async () => {
    const o = await make();
    auditFailsAfterInsert();
    expect((await answer(a.agent, o.id)).status).toBe(500);
    expect((await row(o.id)).status).toBe('open');
    await answer(a.agent, o.id).expect(200);
    auditFailsAfterInsert();
    expect((await patch(auditor, o.id, { status: 'closed' })).status).toBe(500);
    expect((await row(o.id)).status).toBe('answered');
    expect((await row(o.id)).closed_by).toBeNull();
  });
});

describe('la base lo impone, no solo la API (SEG-69)', () => {
  let open: any;
  let closed: any;
  beforeAll(async () => {
    open = await make({ body: 'Base: abierta.' });
    closed = await answered({ body: 'Base: cerrada.' });
    await patch(auditor, closed.id, { status: 'closed' }).expect(200);
  });

  it('nunca se borra: ni siquiera el dueño de la base, y la app ni lo intenta', async () => {
    const db = await connect();
    try {
      await db.query('BEGIN');
      expect(await failure(db, 'delete from tenant.audit_observations where id = $1', [open.id])).toMatch(/nunca se borra|DELETE/);
      expect(await failure(db, 'truncate tenant.audit_observations')).toMatch(/nunca se borra|TRUNCATE|vac/);
      await asApp(db, { tenantId: a.companyId, role: 'auditor', userId: auditorId }, async () => {
        expect(await failure(db, 'delete from tenant.audit_observations where id = $1', [open.id])).toMatch(/permission denied/);
        expect(await failure(db, 'truncate tenant.audit_observations')).toMatch(/permission denied/);
      });
    } finally {
      await db.query('ROLLBACK').finally(() => db.end());
    }
    expect(await row(open.id)).toBeDefined();
  });

  it('una cerrada no se toca para nadie: ni el texto, ni el estado, ni la respuesta', async () => {
    const db = await connect();
    try {
      await db.query('BEGIN');
      for (const set of ["body = 'Cambiado'", "status = 'open'", "answer_note = 'Cambiada'", 'closed_at = null']) {
        expect(await failure(db, `update tenant.audit_observations set ${set} where id = $1`, [closed.id])).toMatch(/inmutable|cerrada|check/i);
      }
    } finally {
      await db.query('ROLLBACK').finally(() => db.end());
    }
  });

  it('lo que identifica a la observación no cambia nunca, ni abierta', async () => {
    const db = await connect();
    try {
      await db.query('BEGIN');
      expect(await failure(db, `update tenant.audit_observations set type = 'recommendation' where id = $1`, [open.id])).toMatch(/solo cambian/);
      expect(await failure(db, `update tenant.audit_observations set client_control_id = $2 where id = $1`, [open.id, control1])).toMatch(/solo cambian/);
      expect(await failure(db, `update tenant.audit_observations set created_by = $2 where id = $1`, [open.id, adminId])).toMatch(/solo cambian/);
      expect(await failure(db, `update tenant.audit_observations set body = 'ok' where id = $1`, [open.id])).toBeNull();
    } finally {
      await db.query('ROLLBACK').finally(() => db.end());
    }
  });

  it('solo los pasos del ciclo: una abierta no salta a cerrada, y cerrar exige quien la escribió y la respuesta', async () => {
    const db = await connect();
    try {
      await db.query('BEGIN');
      expect(await failure(db, `update tenant.audit_observations set status = 'closed', closed_by = created_by, closed_at = now() where id = $1`, [open.id])).toMatch(/check|no está permitido/i);
      const respondida = await answered({ body: 'Base: respondida.' });
      expect(await failure(db, `update tenant.audit_observations set status = 'closed', closed_by = $2, closed_at = now() where id = $1`, [respondida.id, adminId])).toMatch(/closed_by_author|check/i);
      expect(await failure(db, `update tenant.audit_observations set status = 'closed', closed_by = created_by, closed_at = now() where id = $1`, [respondida.id])).toBeNull();
    } finally {
      await db.query('ROLLBACK').finally(() => db.end());
    }
  });

  it('el aislamiento entre empresas es de la base: otra empresa no ve ni toca filas ajenas aunque lo intente por SQL', async () => {
    const db = await connect();
    try {
      await db.query('BEGIN');
      await asApp(db, { tenantId: b.companyId, role: 'auditor' }, async () => {
        expect((await db.query('select 1 from tenant.audit_observations where id = $1', [open.id])).rowCount).toBe(0);
        expect(await failure(db, `insert into tenant.audit_observations (id, tenant_id, service_id, created_by, type, body) values (gen_random_uuid(), $1, $2, $3, 'observation', 'x')`, [a.companyId, a.serviceId, auditorId])).toMatch(/row-level security/);
      });
    } finally {
      await db.query('ROLLBACK').finally(() => db.end());
    }
  });
});

describe('un servicio con observaciones no se borra: son historia', () => {
  it('borrar un servicio que SOLO tiene observaciones como historial responde 409 y no deja nada a medias', async () => {
    // Un servicio nuevo, sin evaluaciones ni evidencias ni planes de acción: lo único que lo retiene es la observación (si no, el borrado fallaría en la clave foránea).
    const service = (await b.agent.post('/v1/services').send(servicePayload(`Servicio sin historia ${RUN}`)).expect(201)).body.data.id as string;
    const free = await b.agent.delete(`/v1/services/${(await b.agent.post('/v1/services').send(servicePayload(`Servicio desechable ${RUN}`)).expect(201)).body.data.id}`);
    expect(free.status).toBe(200); // sin observaciones, un servicio sin historia sí se borra

    const created = await make({ body: 'Historia: no se borra.' }, auditorB, service);
    const controls = (await owner<{ n: number }>('select count(*)::int n from tenant.client_controls where service_id = $1', [service]))[0].n;
    expect(controls).toBeGreaterThan(0);
    const res = await b.agent.delete(`/v1/services/${service}`);
    expect(res.status).toBe(409);
    expect(code(res)).toBe('SERVICE_HAS_EVALUATIONS');
    expect((await owner('select 1 from tenant.services where id = $1', [service])).length).toBe(1);
    expect((await owner<{ n: number }>('select count(*)::int n from tenant.client_controls where service_id = $1', [service]))[0].n).toBe(controls);
    expect((await row(created.id)).status).toBe('open');
  });
});

describe('al borrar una empresa archivada (D97), sus observaciones se borran con ella', () => {
  it('las abiertas y las cerradas desaparecen en el borrado definitivo y la base lo permite solo en esa purga', async () => {
    const o1 = await make({ body: 'Purga: abierta.' }, auditorB, b.serviceId);
    const o2 = await make({ body: 'Purga: cerrada.' }, auditorB, b.serviceId);
    await answer(b.agent, o2.id).expect(200);
    await patch(auditorB, o2.id, { status: 'closed' }).expect(200);
    expect((await owner('select 1 from tenant.audit_observations where tenant_id = $1', [b.companyId])).length).toBeGreaterThanOrEqual(2);

    await monkey.post(`/v1/companies/${b.companyId}/deactivation`).send({ confirm_name: b.companyName, reason_code: 'other', reason: 'Prueba de la purga.' }).expect(200);
    await owner(`update platform.companies set archive_until = now() - interval '1 minute' where id = $1`, [b.companyId]);
    const summary = await app.get(PurgeExpiredCompaniesUseCase).execute();
    expect(summary.failed).toEqual([]);
    expect(summary.purged).toContain(b.companyId);
    expect(await owner('select 1 from tenant.audit_observations where tenant_id = $1', [b.companyId])).toHaveLength(0);
    expect(await owner('select 1 from tenant.audit_observations where id = any($1::uuid[])', [[o1.id, o2.id]])).toHaveLength(0);
    // La de la otra empresa sigue intacta.
    expect((await owner('select 1 from tenant.audit_observations where tenant_id = $1', [a.companyId])).length).toBeGreaterThan(0);
  });
});
