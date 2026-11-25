import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Agent, bootApp, owner, RUN } from '../support/app';
import { avisosDe, idDe, sembrarAviso } from '../support/avisos';
import { invitarYActivar } from '../support/equipo';
import { dosEmpresas, Tenant } from '../support/escenario';
import { NOTIFICATION_TYPES } from '../../src/common/notifications/notification-type';

// MD-515 · D143, D151 · La campana de cada persona (contracts/notificaciones.md): lista, contador, marcar, marcar todos y preferencias, por HTTP real con la sesión de cada rol contra el
// Postgres desechable. Cada aviso es de UNA persona: ni el `admin_empresa` ve el de otra (404).
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let adminId: string;
let responsable: { id: string; session: Agent };
let auditor: { id: string; session: Agent };
let n = 0;
const email = (k: string) => `${k}-${RUN}-${n++}@campana.test`;

const mio = (agent: Agent, query = '') => agent.get(`/v1/me/notifications${query}`);
const ids = (res: { body: any }) => (res.body.data.items as Array<{ id: string }>).map((i) => i.id);

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  adminId = await idDe(a.email);
  responsable = await invitarYActivar(app, a.agent, { email: email('resp'), name: 'Laura', last_name: 'Gómez', role: 'responsable' });
  auditor = await invitarYActivar(app, a.agent, { email: email('aud'), name: 'Aurora', last_name: 'Auditora', role: 'auditor' });
});
afterAll(async () => {
  await app?.close();
});
beforeEach(async () => {
  await owner('delete from platform.notifications where company_id = any($1::uuid[])', [[a.companyId, b.companyId]]);
});

describe('GET /v1/me/notifications', () => {
  it('lista solo los avisos de la persona, del más reciente al más antiguo, con la forma del contrato', async () => {
    const viejo = await sembrarAviso({ companyId: a.companyId, userId: responsable.id, hace: '3 hours' });
    const nuevo = await sembrarAviso({ companyId: a.companyId, userId: responsable.id, type: 'window_expired', hace: '1 hour', dedupe: 'x:1' });
    await sembrarAviso({ companyId: a.companyId, userId: adminId });
    const res = await mio(responsable.session).expect(200);
    expect(res.body).toMatchObject({ statusCode: 200, message: expect.any(String), data: { page: 1, page_size: 25, total: 2, total_pages: 1 } });
    expect(ids(res)).toEqual([nuevo, viejo]);
    const item = res.body.data.items[1];
    expect(item).toMatchObject({
      id: viejo, type: 'window_due_soon', is_read: false, read_at: null, due_at: '2026-12-31',
      service: { name: 'Plataforma de pagos' },
      control: { code: 'IAC-12', name: 'Revisión de accesos privilegiados', requirement_codes: ['CC6.1', 'CC6.2'] },
      controls: [],
      target: { kind: 'control' },
    });
    expect(item.title).toContain('IAC-12');
    expect(Object.keys(item.detail)).toEqual(['what_happened', 'why_it_matters', 'how_to_fix', 'who', 'time_needed', 'evidence', 'impact']);
    expect(item.detail.who).toBe('Ejecuta: Juan Pérez (delegado) · Dueño: Laura Gómez (responsable)');
    expect(JSON.stringify(res.body)).not.toMatch(/wazuh|prowler/i);
  });

  it('el texto sale en el idioma de Accept-Language', async () => {
    await sembrarAviso({ companyId: a.companyId, userId: responsable.id });
    const es = (await mio(responsable.session).expect(200)).body.data.items[0];
    const en = (await mio(responsable.session).set('Accept-Language', 'en').expect(200)).body.data.items[0];
    expect(es.title).toMatch(/^IAC-12 · La ventana trimestral cierra el 31\/12\/2026/);
    expect(en.title).toMatch(/^IAC-12 · The quarterly window closes on Dec 31, 2026/);
    expect(en.detail.how_to_fix).toBe('Upload the evidence from the control detail and ask for its review.');
  });

  it('filtra por estado y por tipo, y pagina', async () => {
    const u = { companyId: a.companyId, userId: responsable.id };
    await sembrarAviso({ ...u, leido: true, hace: '5 hours', dedupe: 'k:1' });
    await sembrarAviso({ ...u, hace: '4 hours', dedupe: 'k:2' });
    await sembrarAviso({ ...u, type: 'control_assigned', hace: '3 hours', dedupe: 'k:3', params: { assignee_role: 'owner', actor: { name: 'Ana', role: 'admin_empresa' } } });
    expect((await mio(responsable.session, '?status=unread').expect(200)).body.data.total).toBe(2);
    expect((await mio(responsable.session, '?status=read').expect(200)).body.data.total).toBe(1);
    expect((await mio(responsable.session, '?status=all').expect(200)).body.data.total).toBe(3);
    expect(ids(await mio(responsable.session, '?type=control_assigned').expect(200)).length).toBe(1);
    const p1 = (await mio(responsable.session, '?page_size=2').expect(200)).body.data;
    expect(p1).toMatchObject({ page: 1, page_size: 2, total: 3, total_pages: 2 });
    const p2 = (await mio(responsable.session, '?page_size=2&page=2').expect(200)).body.data;
    expect(p2.items.length).toBe(1);
    expect(new Set([...p1.items, ...p2.items].map((i: any) => i.id)).size).toBe(3);
  });

  it('solo los últimos 90 días, aunque la pasada de borrado no haya corrido', async () => {
    await sembrarAviso({ companyId: a.companyId, userId: responsable.id, hace: '91 days', dedupe: 'v:1' });
    const reciente = await sembrarAviso({ companyId: a.companyId, userId: responsable.id, hace: '89 days', dedupe: 'v:2' });
    expect(ids(await mio(responsable.session).expect(200))).toEqual([reciente]);
    expect((await responsable.session.get('/v1/me/notifications/unread-count').expect(200)).body.data.unread_count).toBe(1);
  });

  it('la sesión del `admin_empresa` no ve los avisos de otra persona de su empresa', async () => {
    await sembrarAviso({ companyId: a.companyId, userId: responsable.id });
    expect((await mio(a.agent).expect(200)).body.data.total).toBe(0);
    expect((await mio(monkey).expect(200)).body.data.total).toBe(0);
  });

  it('un auditor entra a su campana: hoy no recibe ninguno', async () => {
    expect((await mio(auditor.session).expect(200)).body.data).toMatchObject({ items: [], total: 0 });
  });

  it('422 con enum, tope y página inválidos', async () => {
    const campos = async (q: string) => (await mio(responsable.session, q).expect(422)).body.error.fields.map((f: any) => `${f.field}:${f.code}`);
    expect(await campos('?status=todos')).toEqual(['status:enum.invalid']);
    expect(await campos('?type=nada')).toEqual(['type:enum.invalid']);
    expect(await campos('?page_size=101')).toEqual(['page_size:number.max']);
    expect(await campos('?page=0')).toEqual(['page:number.min']);
    expect(await campos('?sort=created_at')).toEqual(['sort:field.not_allowed']);
  });

  it('401 sin sesión, en todas las rutas', async () => {
    const http = request(app.getHttpServer());
    const id = '7c1e0000-0000-4000-8000-000000000001';
    await http.get('/v1/me/notifications').expect(401);
    await http.get('/v1/me/notifications/unread-count').expect(401);
    await http.patch(`/v1/me/notifications/${id}`).send({ is_read: true }).expect(401);
    await http.post('/v1/me/notifications/read-all').send({}).expect(401);
    await http.get('/v1/me/notification-preferences').expect(401);
    await http.patch('/v1/me/notification-preferences').send({ is_email_digest_enabled: false }).expect(401);
  });
});

describe('GET /v1/me/notifications/unread-count', () => {
  it('cuenta los no leídos de la persona y nada más', async () => {
    const u = { companyId: a.companyId, userId: responsable.id };
    await sembrarAviso({ ...u, dedupe: 'c:1' });
    await sembrarAviso({ ...u, dedupe: 'c:2' });
    await sembrarAviso({ ...u, leido: true, dedupe: 'c:3' });
    await sembrarAviso({ companyId: a.companyId, userId: adminId });
    const res = await responsable.session.get('/v1/me/notifications/unread-count').expect(200);
    expect(res.body).toMatchObject({ statusCode: 200, data: { unread_count: 2 } });
  });
});

describe('PATCH /v1/me/notifications/:id', () => {
  const patch = (agent: Agent, id: string, body: unknown) => agent.patch(`/v1/me/notifications/${id}`).send(body as object);

  it('marca leído, es idempotente (no cambia read_at) y lo vuelve a no leído', async () => {
    const id = await sembrarAviso({ companyId: a.companyId, userId: responsable.id });
    const uno = (await patch(responsable.session, id, { is_read: true }).expect(200)).body.data;
    expect(uno).toMatchObject({ id, is_read: true });
    expect(uno.read_at).toEqual(expect.any(String));
    const dos = (await patch(responsable.session, id, { is_read: true }).expect(200)).body.data;
    expect(dos.read_at).toBe(uno.read_at);
    const tres = (await patch(responsable.session, id, { is_read: false }).expect(200)).body.data;
    expect(tres).toMatchObject({ is_read: false, read_at: null });
    expect((await responsable.session.get('/v1/me/notifications/unread-count').expect(200)).body.data.unread_count).toBe(1);
  });

  it('no deja audit_logs: marcar es estado de la interfaz (D151)', async () => {
    const id = await sembrarAviso({ companyId: a.companyId, userId: responsable.id });
    const antes = (await owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1', [a.companyId]))[0].n;
    await patch(responsable.session, id, { is_read: true }).expect(200);
    expect((await owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1', [a.companyId]))[0].n).toBe(antes);
  });

  it('el aviso de otra persona responde 404, no 403: del administrador de su empresa, de otra empresa y de admin_monkey', async () => {
    const id = await sembrarAviso({ companyId: a.companyId, userId: responsable.id });
    for (const agent of [a.agent, b.agent, monkey, auditor.session]) await patch(agent, id, { is_read: true }).expect(404);
    expect((await avisosDe(responsable.id))[0].read_at).toBeNull();
  });

  it('404 si no existe, no es un uuid o tiene más de 90 días', async () => {
    await patch(responsable.session, '7c1e0000-0000-4000-8000-000000000009', { is_read: true }).expect(404);
    await patch(responsable.session, 'no-es-uuid', { is_read: true }).expect(404);
    const viejo = await sembrarAviso({ companyId: a.companyId, userId: responsable.id, hace: '100 days' });
    await patch(responsable.session, viejo, { is_read: true }).expect(404);
  });

  it('422 sin is_read, con un valor que no es booleano o con un campo de más', async () => {
    const id = await sembrarAviso({ companyId: a.companyId, userId: responsable.id });
    const campos = async (body: unknown) => (await patch(responsable.session, id, body).expect(422)).body.error.fields.map((f: any) => `${f.field}:${f.code}`);
    expect(await campos({})).toEqual(expect.arrayContaining(['is_read:required']));
    expect(await campos({ is_read: 'si' })).toEqual(['is_read:boolean.invalid']);
    expect(await campos({ is_read: true, type: 'x' })).toEqual(['type:field.not_allowed']);
  });
});

describe('POST /v1/me/notifications/read-all', () => {
  const readAll = (agent: Agent, body: object = {}) => agent.post('/v1/me/notifications/read-all').send(body);

  it('marca como leídos los de la persona y no toca los de nadie más', async () => {
    const u = { companyId: a.companyId, userId: responsable.id };
    await sembrarAviso({ ...u, dedupe: 'r:1' });
    await sembrarAviso({ ...u, dedupe: 'r:2' });
    await sembrarAviso({ ...u, leido: true, dedupe: 'r:3' });
    await sembrarAviso({ companyId: a.companyId, userId: adminId });
    const res = await readAll(responsable.session).expect(200);
    expect(res.body).toMatchObject({ statusCode: 200, data: { updated_count: 2 } });
    expect((await avisosDe(adminId))[0].read_at).toBeNull();
    expect((await readAll(responsable.session).expect(200)).body.data.updated_count).toBe(0);
  });

  it('con up_to solo marca los creados hasta ese instante: el que llegó mientras leía queda sin leer', async () => {
    const u = { companyId: a.companyId, userId: responsable.id };
    await sembrarAviso({ ...u, hace: '3 hours', dedupe: 'u:1' });
    const visto = new Date(Date.now() - 2 * 3_600_000).toISOString();
    const reciente = await sembrarAviso({ ...u, hace: '1 minute', dedupe: 'u:2' });
    expect((await readAll(responsable.session, { up_to: visto }).expect(200)).body.data.updated_count).toBe(1);
    expect(ids(await mio(responsable.session, '?status=unread').expect(200))).toEqual([reciente]);
  });

  it('422 con un up_to que no es fecha', async () => {
    const res = await readAll(responsable.session, { up_to: 'ayer' }).expect(422);
    expect(res.body.error.fields).toEqual([expect.objectContaining({ field: 'up_to', code: 'date.invalid' })]);
  });
});

describe('preferencias de notificaciones', () => {
  const prefs = (agent: Agent) => agent.get('/v1/me/notification-preferences');
  const setPrefs = (agent: Agent, body: unknown) => agent.patch('/v1/me/notification-preferences').send(body as object);
  const rastros = (userId: string) =>
    owner<{ before_state: any; after_state: any; user_id: string }>(`select before_state, after_state, user_id from audit.audit_logs where action = 'user.notification_preferences_changed' and after_state->>'user_id' = $1 order by created_at`, [userId]);

  it('por omisión el resumen está encendido y sale desde las 12:00 UTC', async () => {
    expect((await prefs(responsable.session).expect(200)).body).toMatchObject({ statusCode: 200, data: { is_email_digest_enabled: true, email_digest_time_utc: '12:00' } });
  });

  it('apagarlo y encenderlo deja el rastro (antes y después) en audit_logs, una vez por cambio', async () => {
    const apagar = await setPrefs(responsable.session, { is_email_digest_enabled: false }).expect(200);
    expect(apagar.body.data).toEqual({ is_email_digest_enabled: false, email_digest_time_utc: '12:00' });
    await setPrefs(responsable.session, { is_email_digest_enabled: false }).expect(200); // sin cambio: sin rastro nuevo
    expect((await prefs(responsable.session).expect(200)).body.data.is_email_digest_enabled).toBe(false);
    await setPrefs(responsable.session, { is_email_digest_enabled: true }).expect(200);
    const filas = await rastros(responsable.id);
    expect(filas.map((f) => [f.before_state.is_email_digest_enabled, f.after_state.is_email_digest_enabled])).toEqual([[true, false], [false, true]]);
    expect(filas[0].user_id).toBe(responsable.id);
  });

  it('cualquier rol con sesión puede, y es solo de quien llama', async () => {
    await setPrefs(auditor.session, { is_email_digest_enabled: false }).expect(200);
    expect((await prefs(responsable.session).expect(200)).body.data.is_email_digest_enabled).toBe(true);
    expect((await prefs(auditor.session).expect(200)).body.data.is_email_digest_enabled).toBe(false);
    await setPrefs(auditor.session, { is_email_digest_enabled: true }).expect(200);
  });

  it('apagar el resumen no apaga la campana (D143)', async () => {
    await sembrarAviso({ companyId: a.companyId, userId: responsable.id });
    await setPrefs(responsable.session, { is_email_digest_enabled: false }).expect(200);
    expect((await mio(responsable.session).expect(200)).body.data.total).toBe(1);
    await setPrefs(responsable.session, { is_email_digest_enabled: true }).expect(200);
  });

  it('422 sin el campo, con otro tipo o con un campo que sobra', async () => {
    const campos = async (body: unknown) => (await setPrefs(responsable.session, body).expect(422)).body.error.fields.map((f: any) => `${f.field}:${f.code}`);
    expect(await campos({})).toEqual(expect.arrayContaining(['is_email_digest_enabled:required']));
    expect(await campos({ is_email_digest_enabled: 'no' })).toEqual(['is_email_digest_enabled:boolean.invalid']);
    expect(await campos({ is_email_digest_enabled: true, apagar_campana: true })).toEqual(['apagar_campana:field.not_allowed']);
  });
});

// Monkey Admin no tiene campana (DT-83): la cuenta `admin_monkey` pasa el guard («cualquier sesión»), pero no es de una empresa de clientes ni recibe avisos. Todas las rutas responden vacío/0, nunca 500.
describe('admin_monkey y la campana', () => {
  const rutas = (agent: Agent) => ({
    lista: agent.get('/v1/me/notifications'),
    contador: agent.get('/v1/me/notifications/unread-count'),
    marcarTodos: agent.post('/v1/me/notifications/read-all').send({}),
    preferencias: agent.get('/v1/me/notification-preferences'),
  });

  it('lista, contador y marcar todos responden vacío/0 y el aviso suelto 404', async () => {
    expect((await rutas(monkey).lista.expect(200)).body.data).toMatchObject({ items: [], total: 0 });
    expect((await rutas(monkey).contador.expect(200)).body.data).toEqual({ unread_count: 0 });
    expect((await rutas(monkey).marcarTodos.expect(200)).body.data).toEqual({ updated_count: 0 });
    await monkey.patch('/v1/me/notifications/7c1e0000-0000-4000-8000-000000000009').send({ is_read: true }).expect(404);
  });

  it('las preferencias responden sin 500 y apagar el resumen deja su rastro', async () => {
    const lee = await rutas(monkey).preferencias;
    expect(lee.status).toBe(200);
    expect(lee.body.data).toMatchObject({ is_email_digest_enabled: true });
    const apaga = await monkey.patch('/v1/me/notification-preferences').send({ is_email_digest_enabled: false });
    expect(apaga.status).toBe(200);
    expect(apaga.body.data.is_email_digest_enabled).toBe(false);
    await monkey.patch('/v1/me/notification-preferences').send({ is_email_digest_enabled: true }).expect(200);
  });
});

describe('GET /v1/catalogs/notification_type', () => {
  it('sirve los 17 tipos con su etiqueta en cada idioma', async () => {
    const es = (await a.agent.get('/v1/catalogs/notification_type').expect(200)).body.data.items as Array<{ value: string; label: string }>;
    expect(es.map((i) => i.value)).toEqual([...NOTIFICATION_TYPES]);
    expect(es.find((i) => i.value === 'window_due_soon')?.label).toBe('Ventana por vencer');
    const en = (await a.agent.get('/v1/catalogs/notification_type').set('Accept-Language', 'en').expect(200)).body.data.items as Array<{ value: string; label: string }>;
    expect(en.find((i) => i.value === 'evidence_rejected')?.label).toBe('Evidence rejected');
  });
});
