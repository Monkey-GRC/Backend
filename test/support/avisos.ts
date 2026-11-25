import { randomUUID } from 'node:crypto';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { owner, PASSWORD } from './app';

// MD-515 · Lo que comparten las pruebas de Notificaciones: sembrar avisos como dueño de la base (sin RLS) y leer el canal en vivo (SSE) como lo haría un navegador.

export type AvisoSembrado = {
  companyId: string;
  userId: string;
  type?: string;
  /** Hace cuánto se creó (intervalo de Postgres, p. ej. `'2 hours'`). */
  hace?: string;
  leido?: boolean;
  dedupe?: string;
  dueAt?: string | null;
  params?: Record<string, unknown>;
  targetId?: string;
};

const PARAMS = (extra: Record<string, unknown> = {}) => ({
  control_code: 'IAC-12',
  control_name: 'Revisión de accesos privilegiados',
  requirement_codes: ['CC6.1', 'CC6.2'],
  service_id: randomUUID(),
  service_name: 'Plataforma de pagos',
  owner: { name: 'Laura Gómez', role: 'responsable' },
  executor: { name: 'Juan Pérez', role: 'delegado' },
  periodicity: 'quarterly',
  ...extra,
});

/** Un aviso escrito directo en la base. Devuelve su id. */
export async function sembrarAviso(a: AvisoSembrado): Promise<string> {
  const [row] = await owner<{ id: string }>(
    `insert into platform.notifications (id, company_id, user_id, type, target_kind, target_id, params, due_at, dedupe_key, read_at, created_at)
     values (gen_random_uuid(), $1, $2, $3::platform.notification_type, 'control', $4, $5::jsonb, $6::date, $7,
             case when $8::boolean then (now() at time zone 'utc') else null end, (now() at time zone 'utc') - $9::interval)
     returning id`,
    [a.companyId, a.userId, a.type ?? 'window_due_soon', a.targetId ?? randomUUID(), JSON.stringify(PARAMS(a.params)), a.dueAt === undefined ? '2026-12-31' : a.dueAt, a.dedupe ?? `sembrado:${randomUUID()}`, a.leido ?? false, a.hace ?? '0 seconds'],
  );
  return row.id;
}

export const avisosDe = (userId: string) =>
  owner<{ id: string; type: string; dedupe_key: string; due_at: string | null; read_at: Date | null; emailed_at: Date | null; params: any; target_id: string }>(
    `select id, type::text, dedupe_key, due_at::text, read_at, emailed_at, params, target_id from platform.notifications where user_id = $1 order by created_at, id`,
    [userId],
  );

export const idDe = async (email: string): Promise<string> => (await owner<{ id: string }>('select id from platform.users where email = $1', [email]))[0].id;

export type EventoSse = { event: string; data: any };
export type Canal = { status: number; contentType: string; eventos: EventoSse[]; esperar: (cuando: (e: EventoSse) => boolean, ms?: number) => Promise<EventoSse>; cerrado: Promise<void>; cerrar: () => void };

/** La cookie de sesión de una persona, para abrir el canal en vivo con ella. */
export async function cookieDe(app: INestApplication, email: string): Promise<string> {
  const res = await request(app.getHttpServer()).post('/v1/auth/login').send({ email, password: PASSWORD }).expect(200);
  return (res.headers['set-cookie'] as unknown as string[]).map((c) => c.split(';')[0]).join('; ');
}

/** Abre `GET /v1/me/notifications/stream` en el servidor que ya escucha (`app.listen(0)`). Sin cookie, el servidor responde 401. */
export function abrirCanal(app: INestApplication, cookie?: string): Promise<Canal> {
  const { port } = app.getHttpServer().address() as AddressInfo;
  return new Promise((resolve, reject) => {
    const eventos: EventoSse[] = [];
    let marcar: (() => void) | null = null;
    let fin!: () => void;
    const cerrado = new Promise<void>((r) => (fin = r));
    const req = http.get({ host: '127.0.0.1', port, path: '/v1/me/notifications/stream', headers: { ...(cookie ? { cookie } : {}), accept: 'text/event-stream' } }, (res) => {
      let buffer = '';
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        buffer += chunk;
        for (let i = buffer.indexOf('\n\n'); i >= 0; i = buffer.indexOf('\n\n')) {
          const bloque = buffer.slice(0, i);
          buffer = buffer.slice(i + 2);
          const event = /^event: (.*)$/m.exec(bloque)?.[1];
          const data = /^data: (.*)$/m.exec(bloque)?.[1];
          if (event && data) eventos.push({ event, data: JSON.parse(data) });
        }
        marcar?.();
      });
      res.on('end', fin);
      res.on('close', fin);
      const esperar = (cuando: (e: EventoSse) => boolean, ms = 8_000) =>
        new Promise<EventoSse>((ok, fallo) => {
          const revisar = () => {
            const e = eventos.find(cuando);
            if (e) {
              marcar = null;
              clearTimeout(t);
              ok(e);
            }
          };
          const t = setTimeout(() => {
            marcar = null;
            fallo(new Error(`el evento no llegó en ${ms} ms; llegaron: ${JSON.stringify(eventos.map((x) => x.event))}`));
          }, ms);
          marcar = revisar;
          revisar();
        });
      resolve({ status: res.statusCode ?? 0, contentType: String(res.headers['content-type'] ?? ''), eventos, esperar, cerrado, cerrar: () => req.destroy() });
    });
    req.on('error', (e) => (req.destroyed ? undefined : reject(e)));
  });
}
