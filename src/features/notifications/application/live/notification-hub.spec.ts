import type { ConfigService } from '@nestjs/config';
import type { Principal } from '../../../../common/auth/principal';
import type { LiveNotification } from '../../domain/notification';
import type { NotificationMaintenanceRepository, NotificationRepository } from '../../domain/notification.repository';
import type { NotificationViewer } from '../notification-view';
import { MAX_CONCURRENT_DISPATCH, MAX_CONNECTIONS_PER_USER, NotificationHub, type LiveEvent } from './notification-hub';

// D151 · Las conexiones del canal en vivo de ESTA instancia: ready primero (lo que llega mientras se abre, se encola), cada persona recibe lo suyo, y ninguna consulta si nadie escucha.
const principal = (userId: string, sessionId = `s-${userId}`): Principal => ({ userId, companyId: 'c1', role: 'responsable', sessionId });
const live = (id: string, unreadCount = 4): LiveNotification => ({ record: { id } as LiveNotification['record'], unreadCount, language: 'es' });

// `opening` es la lectura del contador al abrir una conexión (la primera consulta de `unreadCount`); las demás dan 3.
function build(overrides: { findLive?: jest.Mock; opening?: jest.Mock; dead?: jest.Mock } = {}) {
  const repo = {
    findLive: overrides.findLive ?? jest.fn().mockImplementation((_s, id: string) => Promise.resolve(live(id))),
    unreadCount: jest.fn().mockImplementationOnce(overrides.opening ?? (() => Promise.resolve(3))).mockResolvedValue(3),
  };
  const maintenance = { deadSessions: overrides.dead ?? jest.fn().mockResolvedValue([]) };
  const viewer = { view: jest.fn().mockImplementation((r: { id: string }) => ({ id: r.id })) };
  const hub = new NotificationHub(repo as unknown as NotificationRepository, maintenance as unknown as NotificationMaintenanceRepository, viewer as unknown as NotificationViewer, { get: () => undefined } as unknown as ConfigService);
  const sink = () => {
    const events: LiveEvent[] = [];
    return { events, closed: false, send: (e: LiveEvent) => events.push(e), close() { this.closed = true; } };
  };
  return { hub, repo, maintenance, sink };
}

describe('NotificationHub', () => {
  it('abrir manda `ready` con el contador y registra la conexión', async () => {
    const { hub, sink } = build();
    const s = sink();
    await hub.open(principal('u1'), s);
    expect(s.events).toEqual([{ kind: 'ready', unreadCount: 3 }]);
    expect(hub.size).toBe(1);
  });

  it('un aviso nuevo llega a las conexiones de su persona, con el contador, y a nadie más', async () => {
    const { hub, sink } = build();
    const mia = sink();
    const otra = sink();
    await hub.open(principal('u1'), mia);
    await hub.open(principal('u2'), otra);
    await hub.dispatch({ kind: 'notification', id: 'n1', userId: 'u1', companyId: 'c1' });
    expect(mia.events[1]).toEqual({ kind: 'notification', unreadCount: 4, notification: { id: 'n1' } });
    expect(otra.events).toEqual([{ kind: 'ready', unreadCount: 3 }]);
  });

  it('sin conexiones de esa persona en esta instancia no consulta la base', async () => {
    const { hub, repo } = build();
    await hub.dispatch({ kind: 'notification', id: 'n1', userId: 'nadie', companyId: 'c1' });
    await hub.dispatch({ kind: 'count', userId: 'nadie', companyId: 'c1' });
    expect(repo.findLive).not.toHaveBeenCalled();
    expect(repo.unreadCount).not.toHaveBeenCalled();
  });

  it('un aviso duplicado (no existe) o un fallo de la base no publican nada ni lanzan', async () => {
    const findLive = jest.fn().mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('la base no responde'));
    const { hub, sink } = build({ findLive });
    const s = sink();
    await hub.open(principal('u1'), s);
    await expect(hub.dispatch({ kind: 'notification', id: 'dup', userId: 'u1', companyId: 'c1' })).resolves.toBeUndefined();
    await expect(hub.dispatch({ kind: 'notification', id: 'falla', userId: 'u1', companyId: 'c1' })).resolves.toBeUndefined();
    expect(s.events).toEqual([{ kind: 'ready', unreadCount: 3 }]);
  });

  it('el cambio del contador por otra pestaña llega como `unread_count`', async () => {
    const { hub, sink } = build();
    const s = sink();
    await hub.open(principal('u1'), s);
    await hub.dispatch({ kind: 'count', userId: 'u1', companyId: 'c1' });
    expect(s.events[1]).toEqual({ kind: 'unread_count', unreadCount: 3 });
  });

  it('lo que llega mientras se lee el contador de apertura se encola y sale después de `ready`', async () => {
    let soltar!: (v: number) => void;
    const opening = jest.fn().mockReturnValue(new Promise((r) => (soltar = r)));
    const { hub, sink } = build({ opening });
    const s = sink();
    const abierta = hub.open(principal('u1'), s);
    await hub.dispatch({ kind: 'notification', id: 'n1', userId: 'u1', companyId: 'c1' });
    expect(s.events).toEqual([]);
    soltar(5);
    await abierta;
    expect(s.events.map((e) => e.kind)).toEqual(['ready', 'notification']);
  });

  it('cerrar una conexión la quita; abrir y fallar no deja una conexión a medias', async () => {
    const { hub, sink } = build({ opening: jest.fn().mockRejectedValueOnce(new Error('sin base')).mockResolvedValue(0) });
    await expect(hub.open(principal('u1'), sink())).rejects.toThrow('sin base');
    expect(hub.size).toBe(0);
    const conn = await hub.open(principal('u1'), sink());
    expect(hub.size).toBe(1);
    hub.close(conn);
    expect(hub.size).toBe(0);
  });

  it('el barrido cierra el canal de las sesiones que ya no valen y deja las demás', async () => {
    const dead = jest.fn().mockResolvedValue(['s-u1']);
    const { hub, sink, maintenance } = build({ dead });
    const cerrada = sink();
    const viva = sink();
    await hub.open(principal('u1'), cerrada);
    await hub.open(principal('u2'), viva);
    expect(await hub.sweep()).toBe(1);
    expect(cerrada.closed).toBe(true);
    expect(viva.closed).toBe(false);
    expect(hub.size).toBe(1);
    expect(maintenance.deadSessions).toHaveBeenCalledWith('c1', expect.arrayContaining(['s-u1', 's-u2']), expect.any(Date), 1800);
  });

  it('al apagar la app cierra todas las conexiones', async () => {
    const { hub, sink } = build();
    const s = sink();
    await hub.open(principal('u1'), s);
    hub.onModuleDestroy();
    expect(s.closed).toBe(true);
    expect(hub.size).toBe(0);
  });

  describe('tope de conexiones por persona', () => {
    it('al pasar del tope se cierra la más antigua y las demás siguen', async () => {
      const { hub, sink } = build();
      const sinks = Array.from({ length: MAX_CONNECTIONS_PER_USER + 1 }, sink);
      for (const s of sinks) await hub.open(principal('u1'), s);
      expect(hub.size).toBe(MAX_CONNECTIONS_PER_USER);
      expect(sinks[0].closed).toBe(true);
      expect(sinks.slice(1).every((s) => !s.closed)).toBe(true);
      await hub.dispatch({ kind: 'count', userId: 'u1', companyId: 'c1' });
      expect(sinks[0].events.map((e) => e.kind)).toEqual(['ready']);
      expect(sinks[MAX_CONNECTIONS_PER_USER].events.map((e) => e.kind)).toEqual(['ready', 'unread_count']);
    });

    it('el tope es de cada persona: otra persona no cierra las conexiones de la primera', async () => {
      const { hub, sink } = build();
      const mias = Array.from({ length: MAX_CONNECTIONS_PER_USER }, sink);
      for (const s of mias) await hub.open(principal('u1'), s);
      await hub.open(principal('u2'), sink());
      expect(mias.every((s) => !s.closed)).toBe(true);
      expect(hub.size).toBe(MAX_CONNECTIONS_PER_USER + 1);
    });
  });

  describe('cola por persona', () => {
    const gate = () => {
      let open!: () => void;
      const promise = new Promise<void>((r) => (open = r));
      return { promise, open };
    };

    it('mientras se atiende una señal, las siguientes de esa persona quedan pendientes y se repiten UNA vez (coalescencia)', async () => {
      const g = gate();
      const unreadCount = jest.fn().mockImplementationOnce(() => g.promise.then(() => 7)).mockResolvedValue(9);
      const { hub, repo, sink } = build();
      const s = sink();
      await hub.open(principal('u1'), s);
      repo.unreadCount = unreadCount;
      const first = hub.dispatch({ kind: 'count', userId: 'u1', companyId: 'c1' });
      await Promise.resolve();
      await Promise.resolve();
      const rest = [1, 2, 3].map(() => hub.dispatch({ kind: 'count', userId: 'u1', companyId: 'c1' }));
      expect(unreadCount).toHaveBeenCalledTimes(1);
      g.open();
      await Promise.all([first, ...rest]);
      expect(unreadCount).toHaveBeenCalledTimes(2);
      expect(s.events).toEqual([{ kind: 'ready', unreadCount: 3 }, { kind: 'unread_count', unreadCount: 7 }, { kind: 'unread_count', unreadCount: 9 }]);
    });

    it('el contador llega en el orden en que se leyó, aunque la primera lectura sea la más lenta', async () => {
      const g = gate();
      const findLive = jest.fn().mockImplementationOnce(() => g.promise.then(() => live('n1', 1))).mockImplementation((_s, id: string) => Promise.resolve(live(id, 2)));
      const { hub, sink } = build({ findLive });
      const s = sink();
      await hub.open(principal('u1'), s);
      const a = hub.dispatch({ kind: 'notification', id: 'n1', userId: 'u1', companyId: 'c1' });
      await Promise.resolve();
      await Promise.resolve();
      const b = hub.dispatch({ kind: 'notification', id: 'n2', userId: 'u1', companyId: 'c1' });
      g.open();
      await Promise.all([a, b]);
      expect(s.events.slice(1).map((e) => (e.kind === 'notification' ? [e.notification.id, e.unreadCount] : e.kind))).toEqual([['n1', 1], ['n2', 2]]);
    });

    it('un mismo aviso repetido mientras espera se publica una sola vez', async () => {
      const g = gate();
      const findLive = jest.fn().mockImplementationOnce(() => g.promise.then(() => live('n0'))).mockImplementation((_s, id: string) => Promise.resolve(live(id)));
      const { hub, sink } = build({ findLive });
      await hub.open(principal('u1'), sink());
      const first = hub.dispatch({ kind: 'notification', id: 'n0', userId: 'u1', companyId: 'c1' });
      await Promise.resolve();
      await Promise.resolve();
      const rest = [hub.dispatch({ kind: 'notification', id: 'n1', userId: 'u1', companyId: 'c1' }), hub.dispatch({ kind: 'notification', id: 'n1', userId: 'u1', companyId: 'c1' })];
      g.open();
      await Promise.all([first, ...rest]);
      expect(findLive).toHaveBeenCalledTimes(2);
    });

    it('la concurrencia total tiene tope: nunca hay más personas en consulta a la vez, y todas se atienden', async () => {
      let inFlight = 0;
      let peak = 0;
      const gates: Array<() => void> = [];
      const unreadCount = jest.fn().mockImplementation(() => {
        inFlight++;
        peak = Math.max(peak, inFlight);
        return new Promise<number>((resolve) =>
          gates.push(() => {
            inFlight--;
            resolve(1);
          }),
        );
      });
      const { hub, repo, sink } = build();
      const users = Array.from({ length: MAX_CONCURRENT_DISPATCH + 4 }, (_, i) => `u${i}`);
      const sinks = new Map(users.map((u) => [u, sink()]));
      for (const u of users) await hub.open(principal(u), sinks.get(u)!);
      repo.unreadCount = unreadCount;
      const all = Promise.all(users.map((u) => hub.dispatch({ kind: 'count', userId: u, companyId: 'c1' })));
      for (let i = 0; i < 20; i++) await Promise.resolve();
      expect(unreadCount).toHaveBeenCalledTimes(MAX_CONCURRENT_DISPATCH);
      while (gates.length) {
        gates.shift()!();
        for (let i = 0; i < 20; i++) await Promise.resolve();
      }
      await all;
      expect(peak).toBe(MAX_CONCURRENT_DISPATCH);
      expect(unreadCount).toHaveBeenCalledTimes(users.length);
      for (const s of sinks.values()) expect(s.events.map((e) => e.kind)).toEqual(['ready', 'unread_count']);
    });

    it('un fallo de la base no frena la cola: el siguiente aviso de esa persona sí sale', async () => {
      const findLive = jest.fn().mockRejectedValueOnce(new Error('sin base')).mockImplementation((_s, id: string) => Promise.resolve(live(id)));
      const { hub, sink } = build({ findLive });
      const s = sink();
      await hub.open(principal('u1'), s);
      await hub.dispatch({ kind: 'notification', id: 'a', userId: 'u1', companyId: 'c1' });
      await hub.dispatch({ kind: 'notification', id: 'b', userId: 'u1', companyId: 'c1' });
      expect(s.events.map((e) => e.kind)).toEqual(['ready', 'notification']);
    });
  });

  it('al reconectar el canal de Postgres cada persona con conexión recibe su contador al día', async () => {
    const { hub, sink, repo } = build();
    const [a1, a2, b] = [sink(), sink(), sink()];
    await hub.open(principal('u1'), a1);
    await hub.open(principal('u1'), a2);
    await hub.open(principal('u2'), b);
    await hub.announceReconnect();
    for (const s of [a1, a2, b]) expect(s.events).toEqual([{ kind: 'ready', unreadCount: 3 }, { kind: 'unread_count', unreadCount: 3 }]);
    expect(repo.unreadCount).toHaveBeenCalledTimes(3 + 2); // las tres aperturas y una consulta por persona (no por conexión)
  });
});
