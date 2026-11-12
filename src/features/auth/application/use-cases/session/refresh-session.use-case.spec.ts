import { DomainError } from '../../../../../common/errors/domain-error';
import { TokenHasher } from '../../../../../common/security/token-hasher';
import { AuthUser } from '../../../domain/entities/auth-user.entity';
import { Session } from '../../../domain/entities/session.entity';
import type { SessionPolicy } from '../../../domain/entities/session.entity';
const REFRESH_COOKIE = 'mnk_refresh';
import { AuthController } from '../../../presentation/auth.controller';
import { RefreshSessionUseCase } from './refresh-session.use-case';

// La carrera entre pestañas: la segunda llega con un refresh token ya rotado. Sin base de datos: repositorios en memoria y el controlador real.
const policy: SessionPolicy = { accessTokenTtl: 900, idleTimeout: 1800, maxDuration: 28800 };

class FakeTokens extends TokenHasher {
  private n = 0;
  generate() { return `new-${++this.n}`; }
  hash(token: string) { return `h:${token}`; }
}

function setup(opts: { session?: Session; userStatus?: 'active' | 'inactive' } = {}) {
  const byHash = new Map<string, Session>();
  if (opts.session) byHash.set('h:valid', opts.session);
  const sessions = {
    findByRefreshTokenHash: async (h: string) => byHash.get(h) ?? null,
    revoke: async () => undefined,
    rotate: async (_s: unknown, id: string, newHash: string) => {
      const current = [...byHash.entries()].find(([, v]) => v.id === id);
      if (current) { byHash.delete(current[0]); byHash.set(newHash, current[1]); }
    },
  };
  const users = {
    findById: async () => new AuthUser('u-1', 'co-1', 'ACME', 'ana@acme.com', null, null, 'admin_empresa', opts.userStatus ?? 'active', false, null, new Date()),
  };
  const accessTokens = { sign: async () => 'access.jwt' };
  const useCase = new RefreshSessionUseCase(users as never, sessions as never, new FakeTokens(), accessTokens as never, policy);
  // Solo importan `refresh` (2.º parámetro) y `policy` (último); el resto de casos de uso no se tocan.
  const deps: unknown[] = Array(17).fill(undefined);
  deps[1] = useCase;
  deps[16] = policy;
  const controller = new (AuthController as unknown as new (...a: unknown[]) => AuthController)(...deps);
  return { controller };
}

function http(cookie?: string) {
  const set: string[] = [];
  const cleared: string[] = [];
  const req = { cookies: cookie ? { [REFRESH_COOKIE]: cookie } : {}, get: () => undefined } as never;
  const res = {
    cookie: (name: string) => set.push(name),
    clearCookie: (name: string) => cleared.push(name),
  } as never;
  return { req, res, set, cleared };
}

const now = () => new Date();
const liveSession = () => new Session('s-1', 'co-1', 'u-1', now(), now(), new Date(Date.now() + 3600_000), null);

describe('POST /auth/refresh · carrera entre pestañas', () => {
  it('token desconocido (ya rotado): 401 SESSION_EXPIRED y NO borra las cookies', async () => {
    const { controller } = setup({ session: liveSession() });
    const h = http('stale');
    await expect(controller.renew(h.req, h.res)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });
    expect(h.cleared).toEqual([]);
    expect(h.set).toEqual([]);
  });

  it('sin cookie: 401 SESSION_EXPIRED sin tocar cookies', async () => {
    const { controller } = setup();
    const h = http();
    await expect(controller.renew(h.req, h.res)).rejects.toBeInstanceOf(DomainError);
    expect(h.cleared).toEqual([]);
  });

  it.each([
    ['vencida', new Session('s-1', 'co-1', 'u-1', now(), now(), new Date(Date.now() - 1000), null)],
    ['inactiva', new Session('s-1', 'co-1', 'u-1', now(), new Date(Date.now() - 3600_000), new Date(Date.now() + 3600_000), null)],
    ['revocada', new Session('s-1', 'co-1', 'u-1', now(), now(), new Date(Date.now() + 3600_000), now())],
  ])('sesión %s: 401 SESSION_EXPIRED y SÍ borra las cookies', async (_n, session) => {
    const { controller } = setup({ session });
    const h = http('valid');
    await expect(controller.renew(h.req, h.res)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });
    expect(h.cleared).toEqual(expect.arrayContaining(['mnk_access', 'mnk_refresh']));
  });

  it('cuenta inactiva: ACCOUNT_INACTIVE y SÍ borra las cookies', async () => {
    const { controller } = setup({ session: liveSession(), userStatus: 'inactive' });
    const h = http('valid');
    await expect(controller.renew(h.req, h.res)).rejects.toMatchObject({ code: 'ACCOUNT_INACTIVE' });
    expect(h.cleared).toEqual(expect.arrayContaining(['mnk_access', 'mnk_refresh']));
  });

  it('rotación normal: cookies nuevas, y reusar el token viejo ya no borra nada', async () => {
    const { controller } = setup({ session: liveSession() });
    const first = http('valid');
    await controller.renew(first.req, first.res);
    expect(first.set).toEqual(expect.arrayContaining(['mnk_access', 'mnk_refresh']));
    expect(first.cleared).toEqual([]);
    const second = http('valid');
    await expect(controller.renew(second.req, second.res)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });
    expect(second.cleared).toEqual([]);
  });
});
