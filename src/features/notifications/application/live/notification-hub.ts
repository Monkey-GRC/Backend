import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Principal } from '../../../../common/auth/principal';
import { NotificationMaintenanceRepository, NotificationRepository } from '../../domain/notification.repository';
import { NotificationViewer, type NotificationView } from '../notification-view';
import { retentionLimit } from '../notification.use-cases';

/** Lo que el canal en vivo publica (contracts/notificaciones.md · `GET /v1/me/notifications/stream`). La presentación lo pasa a `event:` y `data:`. */
export type LiveEvent =
  | { kind: 'ready'; unreadCount: number }
  | { kind: 'notification'; unreadCount: number; notification: NotificationView }
  | { kind: 'unread_count'; unreadCount: number };

/** Lo que llega por `NOTIFY` (`insertNotifications` y `announceCount`): `{ i, u, c }` un aviso nuevo; `{ k: 'count', u, c }` cambió el contador. */
export type LiveSignal = { kind: 'notification'; id: string; userId: string; companyId: string } | { kind: 'count'; userId: string; companyId: string };

export type LiveSink = { send: (event: LiveEvent) => void; close: () => void };
export type LiveConnection = { id: number; userId: string; companyId: string; sessionId: string; ready: boolean; queue: LiveEvent[]; sink: LiveSink };

const MAX_QUEUED = 100;
const SWEEP_MS = 60_000;
/** Pestañas abiertas por persona en esta instancia; al pasar de aquí se cierra la más antigua (cada conexión es un socket y una cola en memoria). */
export const MAX_CONNECTIONS_PER_USER = 5;
/** Cuántas personas se atienden a la vez (cada una cuesta una consulta con su RLS): una ráfaga de avisos no agota el pool de la base. */
export const MAX_CONCURRENT_DISPATCH = 8;
/** Avisos distintos que pueden esperar por persona mientras se atiende otro; de ahí en adelante se manda solo el contador (la lista se pide completa de todos modos). */
const MAX_PENDING_PER_USER = 50;

/** Lo pendiente de UNA persona: sus avisos por publicar (sin repetir) y si falta refrescar su contador. Se vacía en tandas, de a una a la vez. */
type Lane = { userId: string; companyId: string; notifications: Set<string>; count: boolean; done: Promise<void> };

// D151 · Las conexiones abiertas del canal en vivo EN ESTA instancia, por persona. Un aviso confirmado llega por `LISTEN`/`NOTIFY` de Postgres a todas las réplicas; cada una lo publica a las
// conexiones que tiene de esa persona. El texto viaja en el idioma de la persona (`users.preferred_language`). Si una persona no tiene conexiones aquí, no se hace ninguna consulta.
@Injectable()
export class NotificationHub implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationHub.name);
  private readonly byUser = new Map<string, Set<LiveConnection>>();
  private readonly lanes = new Map<string, Lane>();
  private readonly waiting: Array<() => void> = [];
  private active = 0;
  private nextId = 1;
  private sweeper: NodeJS.Timeout | null = null;

  constructor(
    private readonly notifications: NotificationRepository,
    private readonly maintenance: NotificationMaintenanceRepository,
    private readonly viewer: NotificationViewer,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    this.sweeper = setInterval(() => void this.sweep(), SWEEP_MS);
    this.sweeper.unref();
  }

  onModuleDestroy(): void {
    if (this.sweeper) clearInterval(this.sweeper);
    for (const conn of this.connections()) conn.sink.close();
    this.byUser.clear();
  }

  /** Cuántas conexiones hay abiertas aquí (la prueba la usa para saber que el canal ya está registrado). */
  get size(): number {
    return this.connections().length;
  }

  /**
   * Abre una conexión: se registra PRIMERO (lo que llegue mientras se lee el contador se encola) y después manda `ready` con el contador de la persona. Un aviso que se confirmó antes
   * de registrarse no se pierde: está en el contador.
   */
  async open(p: Principal, sink: LiveSink): Promise<LiveConnection> {
    const conn: LiveConnection = { id: this.nextId++, userId: p.userId, companyId: p.companyId, sessionId: p.sessionId, ready: false, queue: [], sink };
    const mine = (this.byUser.get(p.userId) ?? new Set()).add(conn);
    this.byUser.set(p.userId, mine);
    // Un tope por persona: la conexión más antigua (la primera que se registró) cede su lugar a la nueva.
    for (const old of mine) {
      if (mine.size <= MAX_CONNECTIONS_PER_USER) break;
      this.close(old);
      old.sink.close();
    }
    try {
      const unreadCount = await this.notifications.unreadCount({ companyId: p.companyId, userId: p.userId, role: p.role }, retentionLimit(new Date()));
      sink.send({ kind: 'ready', unreadCount });
      conn.ready = true;
      for (const event of conn.queue.splice(0)) sink.send(event);
    } catch (error) {
      this.close(conn);
      throw error;
    }
    return conn;
  }

  close(conn: LiveConnection): void {
    const set = this.byUser.get(conn.userId);
    set?.delete(conn);
    if (set?.size === 0) this.byUser.delete(conn.userId);
  }

  /**
   * Lo llama quien escucha el canal de Postgres. Nunca lanza: un aviso que no alcanzó a publicarse sigue en la lista y en el contador.
   * Las señales de UNA persona se atienden de a una (cola por persona): si ya hay una en curso, esta queda pendiente y se repite al terminar, así el contador nunca llega desordenado.
   * Resuelve cuando la persona queda sin nada pendiente.
   */
  dispatch(signal: LiveSignal): Promise<void> {
    if (!this.byUser.get(signal.userId)?.size) return Promise.resolve();
    let lane = this.lanes.get(signal.userId);
    if (lane) {
      this.mark(lane, signal);
      return lane.done;
    }
    lane = { userId: signal.userId, companyId: signal.companyId, notifications: new Set(), count: false, done: Promise.resolve() };
    this.lanes.set(signal.userId, lane);
    this.mark(lane, signal);
    lane.done = this.drain(lane);
    return lane.done;
  }

  /** Tras reconectar el canal de Postgres, lo que se confirmó mientras estuvo caído no llegó: cada persona con conexión abierta recibe su contador al día. */
  announceReconnect(): Promise<void> {
    const pending: Array<Promise<void>> = [];
    for (const [userId, conns] of this.byUser) {
      const first = conns.values().next().value;
      if (first) pending.push(this.dispatch({ kind: 'count', userId, companyId: first.companyId }));
    }
    return Promise.all(pending).then(() => undefined);
  }

  private mark(lane: Lane, signal: LiveSignal): void {
    if (signal.kind === 'notification' && (lane.notifications.has(signal.id) || lane.notifications.size < MAX_PENDING_PER_USER)) lane.notifications.add(signal.id);
    else lane.count = true;
  }

  private async drain(lane: Lane): Promise<void> {
    // Cede el turno antes de empezar: las señales que llegan en este mismo instante se juntan en la primera tanda.
    await Promise.resolve();
    try {
      while (lane.notifications.size > 0 || lane.count) {
        const notifications = [...lane.notifications];
        const count = lane.count;
        lane.notifications.clear();
        lane.count = false;
        await this.acquire();
        try {
          await this.publishBatch(lane, notifications, count);
        } finally {
          this.release();
        }
      }
    } finally {
      this.lanes.delete(lane.userId);
    }
  }

  private async publishBatch(lane: Lane, notifications: readonly string[], count: boolean): Promise<void> {
    const scope = { companyId: lane.companyId, userId: lane.userId };
    for (const id of notifications) {
      const targets = this.byUser.get(lane.userId);
      if (!targets?.size) return;
      try {
        const live = await this.notifications.findLive(scope, id, retentionLimit(new Date()));
        if (live) this.publish(targets, { kind: 'notification', unreadCount: live.unreadCount, notification: this.viewer.view(live.record, live.language, new Date()) });
      } catch (error) {
        this.logger.warn(`No se pudo publicar un aviso en vivo: ${(error as Error).message}`);
      }
    }
    const targets = this.byUser.get(lane.userId);
    if (!count || !targets?.size) return;
    try {
      this.publish(targets, { kind: 'unread_count', unreadCount: await this.notifications.unreadCount(scope, retentionLimit(new Date())) });
    } catch (error) {
      this.logger.warn(`No se pudo publicar el contador en vivo: ${(error as Error).message}`);
    }
  }

  private acquire(): Promise<void> {
    if (this.active < MAX_CONCURRENT_DISPATCH) {
      this.active++;
      return Promise.resolve();
    }
    return new Promise((resolve) => this.waiting.push(resolve));
  }

  private release(): void {
    const next = this.waiting.shift();
    if (next) next();
    else this.active--;
  }

  private publish(targets: ReadonlySet<LiveConnection>, event: LiveEvent): void {
    for (const conn of targets) {
      if (conn.ready) conn.sink.send(event);
      else if (conn.queue.length < MAX_QUEUED) conn.queue.push(event);
    }
  }

  // Al cerrar sesión (o vencer, o quedar inactiva), el servidor cierra el canal: cada minuto se comprueba qué sesiones con conexión abierta ya no valen.
  async sweep(now: Date = new Date()): Promise<number> {
    const idle = Number(this.config.get<string>('SESSION_IDLE_TIMEOUT') ?? '1800');
    const byCompany = new Map<string, LiveConnection[]>();
    for (const conn of this.connections()) byCompany.set(conn.companyId, [...(byCompany.get(conn.companyId) ?? []), conn]);
    let closed = 0;
    for (const [companyId, conns] of byCompany) {
      try {
        const dead = new Set(await this.maintenance.deadSessions(companyId, [...new Set(conns.map((c) => c.sessionId))], now, Number.isFinite(idle) && idle > 0 ? idle : 1800));
        for (const conn of conns.filter((c) => dead.has(c.sessionId))) {
          this.close(conn);
          conn.sink.close();
          closed++;
        }
      } catch (error) {
        this.logger.warn(`No se pudo comprobar las sesiones con canal abierto: ${(error as Error).message}`);
      }
    }
    return closed;
  }

  private connections(): LiveConnection[] {
    return [...this.byUser.values()].flatMap((set) => [...set]);
  }
}
