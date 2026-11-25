import { EventEmitter } from 'node:events';
import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { NotificationHub } from '../../application/live/notification-hub';
import { parseSignal, PgNotificationListener } from './pg-notification.listener';

// Un `Client` de pg simulado: cada `new Client()` queda en `clients`, y la prueba decide cuándo conecta, falla o se cae.
class FakeClient extends EventEmitter {
  static instances: FakeClient[] = [];
  connect = jest.fn<Promise<void>, []>(() => new Promise((resolve, reject) => ((this.settleConnect = { resolve, reject }), undefined)));
  query = jest.fn<Promise<unknown>, [string]>().mockResolvedValue(undefined);
  end = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
  settleConnect!: { resolve: () => void; reject: (e: Error) => void };
  constructor(public readonly options: Record<string, unknown>) {
    super();
    FakeClient.instances.push(this);
  }
}
jest.mock('pg', () => ({ Client: jest.fn((options: Record<string, unknown>) => new FakeClient(options)) }));

const flush = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

function build() {
  const hub = { dispatch: jest.fn().mockResolvedValue(undefined), announceReconnect: jest.fn().mockResolvedValue(undefined) };
  const config = { getOrThrow: () => 'postgresql://app@localhost/db' } as unknown as ConfigService;
  const listener = new PgNotificationListener(hub as unknown as NotificationHub, config);
  return { hub, listener };
}

describe('parseSignal · lo que dice un NOTIFY', () => {
  it('un aviso nuevo', () => {
    expect(parseSignal('{"i":"n1","u":"u1","c":"c1"}')).toEqual({ kind: 'notification', id: 'n1', userId: 'u1', companyId: 'c1' });
  });

  it('un cambio del contador', () => {
    expect(parseSignal('{"k":"count","u":"u1","c":"c1"}')).toEqual({ kind: 'count', userId: 'u1', companyId: 'c1' });
  });

  it.each([undefined, '', 'no es json', '{}', '{"i":"n1"}', '{"i":1,"u":"u1","c":"c1"}', '{"u":"u1","c":"c1"}', 'null'])('un mensaje mal formado (%s) se ignora sin lanzar', (raw) => {
    expect(parseSignal(raw)).toBeNull();
  });
});

describe('PgNotificationListener', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    FakeClient.instances = [];
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('abre la conexión con keepalive y tiempo de espera, y escucha el canal', async () => {
    const { listener } = build();
    listener.onApplicationBootstrap();
    const [client] = FakeClient.instances;
    expect(client.options).toMatchObject({ keepAlive: true, connectionTimeoutMillis: expect.any(Number), query_timeout: expect.any(Number) });
    expect(client.options.connectionTimeoutMillis).toBeGreaterThan(0);
    client.settleConnect.resolve();
    await flush();
    expect(client.query).toHaveBeenCalledWith(expect.stringMatching(/^LISTEN /));
    await listener.onModuleDestroy();
  });

  it('un `connect()` colgado no bloquea el arranque', async () => {
    const { listener } = build();
    expect(listener.onApplicationBootstrap()).toBeUndefined();
    expect(FakeClient.instances[0].connect).toHaveBeenCalledTimes(1); // sigue sin resolver y la app ya arrancó
    await listener.onModuleDestroy();
  });

  it('un aviso que llega por la conexión se pasa al hub; uno mal formado se ignora', async () => {
    const { listener, hub } = build();
    listener.onApplicationBootstrap();
    const [client] = FakeClient.instances;
    client.settleConnect.resolve();
    await flush();
    client.emit('notification', { channel: 'x', payload: '{"i":"n1","u":"u1","c":"c1"}' });
    client.emit('notification', { channel: 'x', payload: 'basura' });
    expect(hub.dispatch).toHaveBeenCalledTimes(1);
    expect(hub.dispatch).toHaveBeenCalledWith({ kind: 'notification', id: 'n1', userId: 'u1', companyId: 'c1' });
    await listener.onModuleDestroy();
  });

  it('la primera conexión también pide refrescar los contadores (las conexiones SSE abiertas durante el arranque)', async () => {
    const { listener, hub } = build();
    listener.onApplicationBootstrap();
    expect(hub.announceReconnect).not.toHaveBeenCalled(); // aún no escucha
    FakeClient.instances[0].settleConnect.resolve();
    await flush();
    expect(hub.announceReconnect).toHaveBeenCalledTimes(1);
    await listener.onModuleDestroy();
  });

  it('si la conexión falla reconecta con espera creciente, y al volver pide refrescar los contadores del hub', async () => {
    const { listener, hub } = build();
    listener.onApplicationBootstrap();
    FakeClient.instances[0].settleConnect.reject(new Error('timeout'));
    await flush();
    expect(FakeClient.instances).toHaveLength(1);

    await jest.advanceTimersByTimeAsync(999);
    expect(FakeClient.instances).toHaveLength(1);
    await jest.advanceTimersByTimeAsync(1); // 1 s
    expect(FakeClient.instances).toHaveLength(2);
    FakeClient.instances[1].settleConnect.reject(new Error('sigue caída'));
    await flush();

    await jest.advanceTimersByTimeAsync(1_999);
    expect(FakeClient.instances).toHaveLength(2);
    await jest.advanceTimersByTimeAsync(1); // 2 s: el doble
    expect(FakeClient.instances).toHaveLength(3);
    expect(hub.announceReconnect).not.toHaveBeenCalled();
    FakeClient.instances[2].settleConnect.resolve();
    await flush();
    expect(hub.announceReconnect).toHaveBeenCalledTimes(1);
    await listener.onModuleDestroy();
  });

  it('la espera crece hasta un tope y se reinicia tras una conexión sana', async () => {
    const { listener } = build();
    listener.onApplicationBootstrap();
    const waits: number[] = [];
    for (let i = 0; i < 8; i++) {
      FakeClient.instances[i].settleConnect.reject(new Error('caída'));
      await flush();
      const before = FakeClient.instances.length;
      let waited = 0;
      while (FakeClient.instances.length === before) {
        await jest.advanceTimersByTimeAsync(500);
        waited += 500;
      }
      waits.push(waited);
    }
    expect(waits).toEqual([1_000, 2_000, 4_000, 8_000, 16_000, 30_000, 30_000, 30_000]);
    FakeClient.instances[8].settleConnect.resolve();
    await flush();
    FakeClient.instances[8].emit('end');
    await jest.advanceTimersByTimeAsync(999);
    expect(FakeClient.instances).toHaveLength(9);
    await jest.advanceTimersByTimeAsync(1);
    expect(FakeClient.instances).toHaveLength(10);
    await listener.onModuleDestroy();
  });

  it('un `error` en una conexión sana la cierra, reconecta y refresca los contadores; el cierre posterior no duplica el intento', async () => {
    const { listener, hub } = build();
    listener.onApplicationBootstrap();
    const [first] = FakeClient.instances;
    first.settleConnect.resolve();
    await flush();

    first.emit('error', new Error('connection terminated'));
    first.emit('end');
    expect(first.end).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1_000);
    expect(FakeClient.instances).toHaveLength(2);
    FakeClient.instances[1].settleConnect.resolve();
    await flush();
    expect(hub.announceReconnect).toHaveBeenCalledTimes(2);
    // El `error` de una conexión ya descartada no tumba nada ni dispara otro intento.
    expect(() => first.emit('error', new Error('tarde'))).not.toThrow();
    await jest.advanceTimersByTimeAsync(60_000);
    expect(FakeClient.instances).toHaveLength(2);
    await listener.onModuleDestroy();
  });

  it('al apagar la app cierra la conexión y deja de reconectar', async () => {
    const { listener } = build();
    listener.onApplicationBootstrap();
    const [first] = FakeClient.instances;
    first.settleConnect.resolve();
    await flush();
    await listener.onModuleDestroy();
    expect(first.end).toHaveBeenCalledTimes(1);
    first.emit('end');
    await jest.advanceTimersByTimeAsync(60_000);
    expect(FakeClient.instances).toHaveLength(1);
  });

  it('apagar mientras un `connect()` está colgado no espera: cierra pasado un instante y no reconecta', async () => {
    const { listener } = build();
    listener.onApplicationBootstrap();
    const [first] = FakeClient.instances;
    first.end.mockReturnValue(new Promise(() => undefined)); // un end() que no termina
    const destroyed = listener.onModuleDestroy();
    await jest.advanceTimersByTimeAsync(2_000);
    await destroyed;
    first.settleConnect.reject(new Error('cancelado'));
    await jest.advanceTimersByTimeAsync(60_000);
    expect(FakeClient.instances).toHaveLength(1);
  });
});
