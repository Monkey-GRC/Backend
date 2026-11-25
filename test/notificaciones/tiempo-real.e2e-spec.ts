import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { NotificationEmitter } from '../../src/common/notifications/notification-emitter';
import type { NotificationDraft } from '../../src/common/notifications/notification-draft';
import { MAX_CONNECTIONS_PER_USER, NotificationHub } from '../../src/features/notifications/application/live/notification-hub';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { Agent, bootApp, owner, RUN } from '../support/app';
import { abrirCanal, Canal, cookieDe, sembrarAviso } from '../support/avisos';
import { controlesDe } from '../support/asignaciones';
import { invitarYActivar } from '../support/equipo';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-515 · D151 · El canal en vivo de la campana (`GET /v1/me/notifications/stream`, SSE): un aviso confirmado llega al instante a las conexiones abiertas de su destinatario, por LISTEN/NOTIFY de
// Postgres (así también entre réplicas). La prueba abre conexiones HTTP reales contra el servidor que escucha, con la cookie de sesión, como lo haría el navegador.
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkeyEmail: string;
let responsable: { id: string; email: string; session: Agent };
let otra: { id: string; email: string; session: Agent };
let controlX: string;
let n = 0;
const abiertos: Canal[] = [];
const email = (k: string) => `${k}-${RUN}-${n++}@tiempo-real.test`;
const putOwner = (ownerId: string | null) => a.agent.put('/v1/assignments/owner').send({ client_control_ids: [controlX], owner_id: ownerId });
const esperarUnPoco = (ms = 700) => new Promise((r) => setTimeout(r, ms));

const canalDe = async (persona: { email: string }): Promise<Canal> => {
  const canal = await abrirCanal(app, await cookieDe(app, persona.email));
  abiertos.push(canal);
  return canal;
};
const cuenta = async (agent: Agent, role: 'responsable') => {
  const e = email(role);
  const p = await invitarYActivar(app, agent, { email: e, name: 'Laura', last_name: 'Gómez', role });
  return { id: p.id, email: e, session: p.session };
};

beforeAll(async () => {
  app = await bootApp();
  await app.listen(0, '127.0.0.1');
  ({ a, b, monkeyEmail } = await dosEmpresas(app));
  responsable = await cuenta(a.agent, 'responsable');
  otra = await cuenta(a.agent, 'responsable');
  controlX = (await controlesDe(a.serviceId))[0];
});
afterAll(async () => {
  for (const c of abiertos) c.cerrar();
  await app?.close();
});
beforeEach(async () => {
  await owner('delete from platform.client_control_assignments where company_id = $1', [a.companyId]);
  await owner('delete from platform.notifications where company_id = any($1::uuid[])', [[a.companyId, b.companyId]]);
});
afterEach(() => {
  jest.restoreAllMocks();
  // Cada prueba empieza sin canales abiertos: el servidor tiene un tope de conexiones por persona y los que quedan abiertos lo gastarían.
  for (const c of abiertos.splice(0)) c.cerrar();
});

describe('GET /v1/me/notifications/stream', () => {
  it('sin sesión responde 401 y no abre canal', async () => {
    const canal = await abrirCanal(app);
    expect(canal.status).toBe(401);
    expect(canal.contentType).toContain('application/json');
    canal.cerrar();
  });

  it('la cuenta admin_monkey (sin campana, DT-83) abre el canal vacío: `ready` con 0, nunca 500', async () => {
    const canal = await canalDe({ email: monkeyEmail });
    expect(canal.status).toBe(200);
    expect((await canal.esperar((e) => e.event === 'ready')).data).toEqual({ unread_count: 0 });
  });

  it('abre un canal text/event-stream y lo primero que manda es `ready` con el contador de la persona', async () => {
    await sembrarAviso({ companyId: a.companyId, userId: responsable.id, dedupe: 'rt:1' });
    await sembrarAviso({ companyId: a.companyId, userId: responsable.id, dedupe: 'rt:2' });
    await sembrarAviso({ companyId: a.companyId, userId: responsable.id, dedupe: 'rt:3', leido: true });
    const canal = await canalDe(responsable);
    expect(canal.status).toBe(200);
    expect(canal.contentType).toContain('text/event-stream');
    expect((await canal.esperar((e) => e.event === 'ready')).data).toEqual({ unread_count: 2 });
  });

  it('un aviso confirmado llega en la conexión abierta, con el contador nuevo y el objeto aviso del contrato', async () => {
    await sembrarAviso({ companyId: a.companyId, userId: responsable.id, dedupe: 'rt:previo' });
    const canal = await canalDe(responsable);
    await canal.esperar((e) => e.event === 'ready');
    await putOwner(responsable.id).expect(200);
    const { data } = await canal.esperar((e) => e.event === 'notification');
    expect(data.unread_count).toBe(2);
    expect(data.notification).toMatchObject({
      type: 'control_assigned', is_read: false, read_at: null,
      control: { id: controlX }, service: { id: a.serviceId, name: a.serviceName }, target: { kind: 'control', id: controlX, service_id: a.serviceId },
    });
    expect(data.notification.title).toMatch(/^[A-Z]+-\d+ · Te asignaron este control como dueño$/);
    expect(Object.keys(data.notification.detail)).toHaveLength(7);
    // Lo mismo que ve en la lista.
    const lista = (await responsable.session.get('/v1/me/notifications?type=control_assigned').expect(200)).body.data.items[0];
    expect(lista.id).toBe(data.notification.id);
  });

  it('el texto viaja en el idioma de la persona (`preferred_language`)', async () => {
    await owner(`update platform.users set preferred_language = 'en' where id = $1`, [responsable.id]);
    try {
      const canal = await canalDe(responsable);
      await canal.esperar((e) => e.event === 'ready');
      await putOwner(responsable.id).expect(200);
      expect((await canal.esperar((e) => e.event === 'notification')).data.notification.title).toMatch(/You were assigned this control as owner$/);
    } finally {
      await owner(`update platform.users set preferred_language = 'es' where id = $1`, [responsable.id]);
    }
  });

  it('solo recibe lo suyo: otra persona de la misma empresa, el administrador que lo causa y otra empresa no ven nada', async () => {
    const mia = await canalDe(responsable);
    const ajena = await canalDe(otra);
    const admin = await abrirCanal(app, await cookieDe(app, a.email));
    abiertos.push(admin);
    const deB = await abrirCanal(app, await cookieDe(app, b.email));
    abiertos.push(deB);
    for (const c of [mia, ajena, admin, deB]) await c.esperar((e) => e.event === 'ready');
    await putOwner(responsable.id).expect(200);
    await mia.esperar((e) => e.event === 'notification');
    await esperarUnPoco();
    for (const c of [ajena, admin, deB]) expect(c.eventos.map((e) => e.event)).toEqual(['ready']);
  });

  it('cada pestaña recibe el aviso: dos conexiones de la misma persona', async () => {
    const uno = await canalDe(responsable);
    const dos = await canalDe(responsable);
    await uno.esperar((e) => e.event === 'ready');
    await dos.esperar((e) => e.event === 'ready');
    await putOwner(responsable.id).expect(200);
    await uno.esperar((e) => e.event === 'notification');
    await dos.esperar((e) => e.event === 'notification');
  });

  it('marcar leído o todos desde otra pestaña manda `unread_count` al canal', async () => {
    const id = await sembrarAviso({ companyId: a.companyId, userId: responsable.id, dedupe: 'rt:m1' });
    await sembrarAviso({ companyId: a.companyId, userId: responsable.id, dedupe: 'rt:m2' });
    const canal = await canalDe(responsable);
    expect((await canal.esperar((e) => e.event === 'ready')).data.unread_count).toBe(2);
    await responsable.session.patch(`/v1/me/notifications/${id}`).send({ is_read: true }).expect(200);
    expect((await canal.esperar((e) => e.event === 'unread_count')).data).toEqual({ unread_count: 1 });
    await responsable.session.post('/v1/me/notifications/read-all').send({}).expect(200);
    await canal.esperar((e) => e.event === 'unread_count' && e.data.unread_count === 0);
  });

  it('solo publica avisos ya confirmados: si la transacción se revierte, no llega nada', async () => {
    const canal = await canalDe(responsable);
    await canal.esperar((e) => e.event === 'ready');
    const emisor = app.get(NotificationEmitter);
    const draft: NotificationDraft = {
      companyId: a.companyId, userId: responsable.id, type: 'window_due_soon', targetKind: 'control', targetId: controlX, dueAt: '2026-12-31', dedupeKey: `rt:rollback:${RUN}`,
      params: { control_code: 'IAC-12', control_name: 'Control', requirement_codes: ['CC6.1'], service_id: a.serviceId, service_name: a.serviceName, owner: null, executor: null, periodicity: 'monthly' },
    };
    await expect(app.get(PrismaService).withScope({ companyId: a.companyId }, async (tx) => {
      await emisor.emit(tx, [draft]);
      throw new Error('se revierte');
    })).rejects.toThrow('se revierte');
    await esperarUnPoco();
    expect(canal.eventos.map((e) => e.event)).toEqual(['ready']);

    await app.get(PrismaService).withScope({ companyId: a.companyId }, (tx) => emisor.emit(tx, [draft]));
    await canal.esperar((e) => e.event === 'notification');
  });

  it('un aviso repetido (mismo dedupe_key) no se guarda ni se vuelve a publicar', async () => {
    const canal = await canalDe(responsable);
    await canal.esperar((e) => e.event === 'ready');
    const emisor = app.get(NotificationEmitter);
    const draft: NotificationDraft = {
      companyId: a.companyId, userId: responsable.id, type: 'window_expired', targetKind: 'control', targetId: controlX, dueAt: '2026-10-31', dedupeKey: `rt:dup:${RUN}`,
      params: { control_code: 'IAC-12', control_name: 'Control', requirement_codes: [], service_id: a.serviceId, service_name: a.serviceName, owner: null, executor: null, periodicity: 'monthly' },
    };
    const prisma = app.get(PrismaService);
    await prisma.withScope({ companyId: a.companyId }, (tx) => emisor.emit(tx, [draft]));
    await canal.esperar((e) => e.event === 'notification');
    await prisma.withScope({ companyId: a.companyId }, (tx) => emisor.emit(tx, [draft]));
    await esperarUnPoco();
    expect(canal.eventos.filter((e) => e.event === 'notification')).toHaveLength(1);
    expect((await owner('select 1 from platform.notifications where user_id = $1', [responsable.id])).length).toBe(1);
  });

  it('al cerrar sesión el servidor cierra el canal', async () => {
    const cookie = await cookieDe(app, otra.email);
    const canal = await abrirCanal(app, cookie);
    abiertos.push(canal);
    await canal.esperar((e) => e.event === 'ready');
    await request(app.getHttpServer()).post('/v1/auth/logout').set('Cookie', cookie).expect((res) => expect([200, 204]).toContain(res.status));
    expect(await app.get(NotificationHub).sweep()).toBeGreaterThanOrEqual(1);
    await canal.cerrado;
  });

  it('tiene un tope de pestañas por persona: al abrir una más, el servidor cierra la más antigua', async () => {
    const cookie = await cookieDe(app, otra.email);
    const canales: Canal[] = [];
    for (let i = 0; i < MAX_CONNECTIONS_PER_USER + 1; i++) {
      const canal = await abrirCanal(app, cookie);
      abiertos.push(canal);
      canales.push(canal);
      await canal.esperar((e) => e.event === 'ready');
    }
    await canales[0].cerrado;
    expect(canales.slice(1).map((c) => c.status)).toEqual(Array(MAX_CONNECTIONS_PER_USER).fill(200));
    await sembrarAviso({ companyId: a.companyId, userId: otra.id, dedupe: 'rt:tope' });
    await otra.session.post('/v1/me/notifications/read-all').send({}).expect(200);
    await canales[MAX_CONNECTIONS_PER_USER].esperar((e) => e.event === 'unread_count');
  });

  it('una conexión que se cae se quita sola: el servidor no sigue publicando en ella', async () => {
    const hub = app.get(NotificationHub);
    const antes = hub.size;
    const canal = await canalDe(responsable);
    await canal.esperar((e) => e.event === 'ready');
    expect(hub.size).toBe(antes + 1);
    canal.cerrar();
    await esperarUnPoco(500);
    expect(hub.size).toBe(antes);
  });
});
