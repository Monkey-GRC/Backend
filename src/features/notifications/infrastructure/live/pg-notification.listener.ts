import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { NOTIFICATION_CHANNEL } from '../../../../common/notifications/notification-type';
import { NotificationHub, type LiveSignal } from '../../application/live/notification-hub';

const RETRY_MIN_MS = 1_000;
const RETRY_MAX_MS = 30_000;
// Un servidor que no contesta no debe dejar la conexión (ni el arranque) esperando para siempre; un cable cortado en silencio se detecta con keepalive de TCP.
const CONNECTION_TIMEOUT_MS = 10_000;
const KEEP_ALIVE_DELAY_MS = 10_000;
const CLOSE_GRACE_MS = 2_000;

/** Lo que dice un `NOTIFY` a esta réplica; `null` si el mensaje no es de este canal o está mal formado (nunca tumba al que escucha). */
export function parseSignal(raw: string | undefined): LiveSignal | null {
  if (!raw) return null;
  try {
    const m = JSON.parse(raw) as { i?: unknown; u?: unknown; c?: unknown; k?: unknown };
    if (typeof m.u !== 'string' || typeof m.c !== 'string') return null;
    if (m.k === 'count') return { kind: 'count', userId: m.u, companyId: m.c };
    if (typeof m.i === 'string') return { kind: 'notification', id: m.i, userId: m.u, companyId: m.c };
    return null;
  } catch {
    return null;
  }
}

// D151 · Una conexión de Postgres dedicada que escucha el canal de avisos (`LISTEN`). Postgres entrega un `NOTIFY` solo cuando su transacción se confirma y a TODAS las réplicas, así que el
// canal en vivo funciona con varias instancias sin más piezas. Si la conexión se cae se reconecta sola (con espera creciente) y, al conectar (la primera vez o al volver), le pide al hub que mande el contador al día a
// quien tiene el canal abierto (lo que se confirmó mientras estuvo caída no llegó); mientras tanto la campana usa `unread-count`.
// El arranque NO espera a la conexión: si la base tarda o no contesta, la app sirve igual y el listener sigue intentando en segundo plano.
// No sirve detrás de un pooler en modo transacción (PgBouncer): ahí `LISTEN` no persiste; la base de la app debe ser una conexión directa.
@Injectable()
export class PgNotificationListener implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(PgNotificationListener.name);
  private client: Client | null = null;
  private retry: NodeJS.Timeout | null = null;
  private delay = RETRY_MIN_MS;
  private stopped = false;

  constructor(private readonly hub: NotificationHub, private readonly config: ConfigService) {}

  onApplicationBootstrap(): void {
    void this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    this.stopped = true;
    if (this.retry) clearTimeout(this.retry);
    this.retry = null;
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    if (this.stopped) return;
    const client = new Client({
      connectionString: this.config.getOrThrow<string>('APP_DATABASE_URL'),
      keepAlive: true,
      keepAliveInitialDelayMillis: KEEP_ALIVE_DELAY_MS,
      connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
      query_timeout: CONNECTION_TIMEOUT_MS,
    });
    this.client = client;
    // Un error de la conexión (`error`) o su cierre (`end`) llevan a reconectar; nunca tumban el proceso.
    client.on('error', (error) => this.lost(client, error));
    client.on('end', () => this.lost(client));
    client.on('notification', (message) => {
      const signal = parseSignal(message.payload);
      if (signal) void this.hub.dispatch(signal);
    });
    try {
      await client.connect();
      await client.query(`LISTEN ${NOTIFICATION_CHANNEL}`);
    } catch (error) {
      this.lost(client, error as Error);
      return;
    }
    if (this.client !== client) return; // se apagó la app o se perdió mientras se conectaba
    this.delay = RETRY_MIN_MS;
    // También la primera vez: las conexiones SSE que se abrieron mientras el listener aún no escuchaba reciben su contador al día.
    void this.hub.announceReconnect();
  }

  private lost(client: Client, error?: Error): void {
    if (this.client !== client) return;
    this.client = null;
    this.release(client);
    if (this.stopped || this.retry) return;
    this.logger.warn(`Se perdió el canal de avisos en vivo${error ? ` (${error.message})` : ''}; se reconecta en ${Math.round(this.delay / 1000)} s.`);
    this.retry = setTimeout(() => {
      this.retry = null;
      void this.connect();
    }, this.delay);
    this.retry.unref();
    this.delay = Math.min(this.delay * 2, RETRY_MAX_MS);
  }

  private release(client: Client): Promise<void> {
    client.removeAllListeners();
    client.on('error', () => undefined);
    return client.end().catch(() => undefined);
  }

  private async disconnect(): Promise<void> {
    const client = this.client;
    this.client = null;
    if (!client) return;
    // Una conexión que está colgada en `connect()` puede no cerrar nunca: se espera un momento y se sigue.
    let timer: NodeJS.Timeout | undefined;
    const grace = new Promise<void>((resolve) => {
      timer = setTimeout(resolve, CLOSE_GRACE_MS);
    });
    await Promise.race([this.release(client), grace]);
    clearTimeout(timer);
  }
}
