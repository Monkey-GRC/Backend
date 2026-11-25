import type { INestApplication } from '@nestjs/common';
import { Agent, bootApp, owner, RUN } from '../support/app';
import { avisosDe, sembrarAviso } from '../support/avisos';
import { correo } from '../support/correo-en-memoria';
import { invitarYActivar } from '../support/equipo';
import { dosEmpresas, Tenant } from '../support/escenario';
import { PurgeExpiredNotificationsUseCase } from '../../src/features/notifications/application/digest/purge-notifications.use-case';
import { SendNotificationDigestsUseCase } from '../../src/features/notifications/application/digest/send-digests.use-case';
import { NotificationScheduler } from '../../src/features/notifications/infrastructure/notification.scheduler';
import { formatDay } from '../../src/features/notifications/domain/notification-text';

// MD-515 · D143, D151 · El resumen diario por correo y la retención de 90 días. El correo es el de memoria de las pruebas (`correo`): nada sale de verdad. Cada persona se resuelve con su propia
// RLS; el envío sale fuera de la transacción y un fallo no marca los avisos como enviados.
const APP_URL = 'https://app.monkey.prueba';
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let n = 0;
const email = (k: string) => `${k}-${RUN}-${n++}@resumen.test`;
const dia = (extra = 0) => new Date(Date.now() + extra * 86_400_000);
const hoy = (extra = 0) => dia(extra).toISOString().slice(0, 10);
// La invitación de cada persona también sale por el correo de memoria: aquí solo importan los resúmenes.
const digestsDe = (to: string) => correo.paraEl(to).filter((m) => m.subject.startsWith('Monkey · '));
const correr = (now: Date = new Date()) => app.get(SendNotificationDigestsUseCase).execute(now);

type Persona = { id: string; email: string; session: Agent };
const persona = async (agent: Agent, role: 'responsable' | 'auditor' = 'responsable'): Promise<Persona> => {
  const e = email(role);
  const p = await invitarYActivar(app, agent, { email: e, name: 'Laura', last_name: 'Gómez', role });
  return { id: p.id, email: e, session: p.session };
};
const aviso = (p: Persona, extra: Partial<Parameters<typeof sembrarAviso>[0]> = {}) => sembrarAviso({ companyId: a.companyId, userId: p.id, ...extra });
const resumenes = (userId: string) => owner<{ status: string; attempts: number; item_count: number; digest_date: string }>(`select status::text, attempts, item_count, digest_date::text from platform.notification_digests where user_id = $1 order by digest_date`, [userId]);
const rastros = (userId: string) => owner<{ result: string; user_id: string | null; tenant_id: string; before_state: any; after_state: any }>(`select result::text, user_id, tenant_id, before_state, after_state from audit.audit_logs where action = 'notification.digest_email' and after_state->>'user_id' = $1 order by created_at`, [userId]);

beforeAll(async () => {
  app = await bootApp({ PLATFORM_APP_URL: APP_URL });
  ({ a, b } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});
beforeEach(async () => {
  correo.reset();
  await owner('delete from platform.notification_digests where company_id = any($1::uuid[])', [[a.companyId, b.companyId]]);
  await owner('delete from platform.notifications where company_id = any($1::uuid[])', [[a.companyId, b.companyId]]);
});

describe('el resumen diario', () => {
  it('sale una vez, con los avisos sin leer: asunto con la cantidad y la fecha, una línea por aviso con el código del control y el servicio, y un botón', async () => {
    const p = await persona(a.agent);
    await aviso(p, { dedupe: 'r:1', hace: '2 hours' });
    await aviso(p, { dedupe: 'r:2', type: 'window_expired', hace: '1 hour' });
    await aviso(p, { dedupe: 'r:3', leido: true });
    const r = await correr();
    expect(r.sent).toBeGreaterThanOrEqual(1);
    const [m, ...otros] = digestsDe(p.email);
    expect(otros).toEqual([]);
    expect(m.subject).toBe(`Monkey · Tienes 2 avisos nuevos (${formatDay(hoy(), 'es')})`);
    expect(m.text).toContain('IAC-12 · La ventana vencida'.slice(0, 7));
    expect(m.text.match(/^- /gm)).toHaveLength(2);
    expect(m.text).toContain('Plataforma de pagos');
    expect(m.text).toContain(`Abrir mis notificaciones: ${APP_URL}`);
    expect(m.text).toContain('desactiva el resumen por correo');
    expect(m.html).toContain(`href="${APP_URL}"`);
    expect(`${m.subject}${m.text}${m.html}`).not.toMatch(/wazuh|prowler/i);
    expect(m.confidential).toBeFalsy();
  });

  it('marca como enviados sus avisos y una segunda pasada del mismo día no manda nada (aunque lleguen avisos nuevos)', async () => {
    const p = await persona(a.agent);
    await aviso(p, { dedupe: 'e:1' });
    await correr();
    expect((await avisosDe(p.id))[0].emailed_at).not.toBeNull();
    await correr();
    await aviso(p, { dedupe: 'e:2' });
    await correr();
    expect(digestsDe(p.email)).toHaveLength(1);
    expect(await resumenes(p.id)).toEqual([{ status: 'sent', attempts: 1, item_count: 1, digest_date: hoy() }]);
  });

  it('al día siguiente lleva solo lo que no entró en un resumen anterior', async () => {
    const p = await persona(a.agent);
    await aviso(p, { dedupe: 'd:1' });
    await correr();
    await aviso(p, { dedupe: 'd:2' });
    await correr(dia(1));
    const mails = digestsDe(p.email);
    expect(mails.map((m) => m.subject)).toEqual([`Monkey · Tienes 1 aviso nuevo (${formatDay(hoy(), 'es')})`, `Monkey · Tienes 1 aviso nuevo (${formatDay(hoy(1), 'es')})`]);
  });

  it('con más de 20 avisos lista 20 y dice «y N más»; todos entran en el resumen', async () => {
    const p = await persona(a.agent);
    for (let i = 0; i < 23; i++) await aviso(p, { dedupe: `m:${i}`, hace: `${i + 1} minutes` });
    await correr();
    const [m] = digestsDe(p.email);
    expect(m.subject).toContain('Tienes 23 avisos nuevos');
    expect(m.text.match(/^- /gm)).toHaveLength(21);
    expect(m.text).toContain('- y 3 más');
    expect((await avisosDe(p.id)).every((x) => x.emailed_at !== null)).toBe(true);
  });

  it('no sale si no hay nada sin leer, ni a quien lo apagó, ni a quien está inactivo', async () => {
    const sinNada = await persona(a.agent);
    await aviso(sinNada, { leido: true });
    const apagado = await persona(a.agent);
    await aviso(apagado);
    await apagado.session.patch('/v1/me/notification-preferences').send({ is_email_digest_enabled: false }).expect(200);
    const inactivo = await persona(a.agent);
    await aviso(inactivo);
    await owner(`update platform.users set status = 'inactive' where id = $1`, [inactivo.id]);
    await correr();
    for (const p of [sinNada, apagado, inactivo]) {
      expect(digestsDe(p.email)).toEqual([]);
      expect(await resumenes(p.id)).toEqual([]);
    }
  });

  it('sale en el idioma de la persona (D111)', async () => {
    const p = await persona(a.agent);
    await owner(`update platform.users set preferred_language = 'en' where id = $1`, [p.id]);
    await aviso(p);
    await correr();
    const [m] = digestsDe(p.email);
    expect(m.subject).toBe(`Monkey · You have 1 new notification (${formatDay(hoy(), 'en')})`);
    expect(m.text).toContain('The quarterly window closes on Dec 31, 2026');
    expect(m.text).toContain('Open my notifications');
  });

  it('cada persona recibe lo suyo: el resumen de una empresa no lleva avisos de otra', async () => {
    const pa = await persona(a.agent);
    const pb = await persona(b.agent);
    await aviso(pa, { dedupe: 'o:1', params: { service_name: 'Servicio de A' } });
    await sembrarAviso({ companyId: b.companyId, userId: pb.id, dedupe: 'o:2', params: { service_name: 'Servicio de B' } });
    await correr();
    expect(digestsDe(pa.email)[0].text).toContain('Servicio de A');
    expect(digestsDe(pa.email)[0].text).not.toContain('Servicio de B');
    expect(digestsDe(pb.email)[0].text).toContain('Servicio de B');
  });
});

describe('si el envío falla', () => {
  it('queda `failed`, sus avisos no se marcan como enviados y deja el rastro con error y sin el cuerpo', async () => {
    const p = await persona(a.agent);
    await aviso(p, { dedupe: 'f:1' });
    correo.falla = true;
    const r = await correr();
    expect(r.failed).toBeGreaterThanOrEqual(1);
    expect(await resumenes(p.id)).toEqual([{ status: 'failed', attempts: 1, item_count: 1, digest_date: hoy() }]);
    expect((await avisosDe(p.id))[0].emailed_at).toBeNull();
    const [rastro] = await rastros(p.id);
    expect(rastro).toMatchObject({ result: 'error', user_id: null, tenant_id: a.companyId, after_state: { user_id: p.id, digest_date: hoy(), item_count: 1 } });
    expect(Object.keys(rastro.after_state).sort()).toEqual(['digest_date', 'item_count', 'user_id']);
    expect(JSON.stringify(rastro)).not.toContain('IAC-12');
  });

  it('la siguiente pasada del mismo día lo reintenta y, si sale, queda `sent` con el rastro de éxito', async () => {
    const p = await persona(a.agent);
    await aviso(p, { dedupe: 'g:1' });
    correo.falla = true;
    await correr();
    correo.falla = false;
    await correr();
    expect(digestsDe(p.email)).toHaveLength(1);
    expect(await resumenes(p.id)).toEqual([{ status: 'sent', attempts: 2, item_count: 1, digest_date: hoy() }]);
    expect((await avisosDe(p.id))[0].emailed_at).not.toBeNull();
    expect((await rastros(p.id)).map((x) => x.result)).toEqual(['error', 'success']);
  });

  it('máximo 3 intentos al día: el cuarto ya no se intenta', async () => {
    const p = await persona(a.agent);
    await aviso(p, { dedupe: 'h:1' });
    correo.falla = true;
    for (let i = 0; i < 3; i++) await correr();
    correo.falla = false;
    await correr();
    expect(digestsDe(p.email)).toEqual([]);
    expect(await resumenes(p.id)).toEqual([{ status: 'failed', attempts: 3, item_count: 1, digest_date: hoy() }]);
    await correr(dia(1));
    expect(digestsDe(p.email)).toHaveLength(1);
  });

  it('un fallo con una persona no frena a las demás', async () => {
    const p1 = await persona(a.agent);
    const p2 = await persona(a.agent);
    await aviso(p1, { dedupe: 'i:1' });
    await aviso(p2, { dedupe: 'i:2' });
    const mailer = correo.send.bind(correo);
    jest.spyOn(correo, 'send').mockImplementation(async (m) => {
      if (m.to === p1.email) throw new Error('rebotó');
      return mailer(m);
    });
    await correr();
    jest.restoreAllMocks();
    expect(digestsDe(p2.email)).toHaveLength(1);
    expect((await resumenes(p1.id))[0].status).toBe('failed');
    expect((await resumenes(p2.id))[0].status).toBe('sent');
  });
});

describe('la tarea (NOTIFICATION_DIGEST_HOUR_UTC = 12)', () => {
  it('antes de las 12:00 UTC no manda resúmenes; desde las 12:00 sí', async () => {
    const p = await persona(a.agent);
    await aviso(p, { dedupe: 's:1' });
    const manana = (h: number, m = 0) => new Date(Date.UTC(dia(1).getUTCFullYear(), dia(1).getUTCMonth(), dia(1).getUTCDate(), h, m));
    const tarea = app.get(NotificationScheduler);
    await tarea.tick(manana(11, 59));
    expect(digestsDe(p.email)).toEqual([]);
    await tarea.tick(manana(12, 0));
    expect(digestsDe(p.email)).toHaveLength(1);
  });
});

describe('la retención de 90 días', () => {
  it('la pasada diaria borra lo de más de 90 días y deja lo reciente, en cada empresa', async () => {
    const pa = await persona(a.agent);
    const pb = await persona(b.agent);
    const viejoA = await aviso(pa, { dedupe: 'p:1', hace: '91 days' });
    const nuevoA = await aviso(pa, { dedupe: 'p:2', hace: '89 days' });
    await sembrarAviso({ companyId: b.companyId, userId: pb.id, dedupe: 'p:3', hace: '120 days' });
    const r = await app.get(PurgeExpiredNotificationsUseCase).execute();
    expect(r.failed).toBe(0);
    expect(r.deleted).toBeGreaterThanOrEqual(2);
    expect((await avisosDe(pa.id)).map((x) => x.id)).toEqual([nuevoA]);
    expect(await avisosDe(pb.id)).toEqual([]);
    expect(viejoA).not.toBe(nuevoA);
  });

  it('el rastro del envío no se borra con los avisos: audit_logs sigue ahí', async () => {
    const p = await persona(a.agent);
    await aviso(p, { dedupe: 'q:1' });
    await correr();
    await app.get(PurgeExpiredNotificationsUseCase).execute();
    expect((await rastros(p.id)).length).toBe(1);
  });
});
