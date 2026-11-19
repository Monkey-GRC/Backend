import { DomainError } from '../../../../../common/errors/domain-error';
import { Session, SessionOwner, SessionPolicy } from '../../../domain/entities/session.entity';
import { ValidateSessionUseCase } from './validate-session.use-case';

const policy: SessionPolicy = { accessTokenTtl: 900, idleTimeout: 1800, maxDuration: 28800 };
const ahora = new Date();
const claims = { sub: 'u1', cid: 'c1', sid: 's1' };

const armar = (found: { session: Session; owner: SessionOwner | null } | null) => {
  const sessions = { findWithOwner: jest.fn().mockResolvedValue(found), revoke: jest.fn(), touch: jest.fn() };
  const tokens = { verify: jest.fn().mockResolvedValue(claims) };
  const useCase = new ValidateSessionUseCase(sessions as never, tokens as never, policy);
  return { useCase, sessions };
};
const sesion = (over: { last?: Date; revoked?: Date | null; expires?: Date } = {}) =>
  new Session('s1', 'c1', 'u1', ahora, over.last ?? ahora, over.expires ?? new Date(ahora.getTime() + 3_600_000), over.revoked ?? null);
const dueno = (status: SessionOwner['status'] = 'active') => new SessionOwner('u1', 'c1', 'responsable', status);

describe('ValidateSessionUseCase', () => {
  it('sin token o con token inválido: UNAUTHENTICATED', async () => {
    const { useCase } = armar(null);
    await expect(useCase.execute(undefined)).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });

  it('una sola lectura devuelve el principal con el rol de la base', async () => {
    const { useCase, sessions } = armar({ session: sesion(), owner: dueno() });
    await expect(useCase.execute('t')).resolves.toEqual({ userId: 'u1', companyId: 'c1', role: 'responsable', sessionId: 's1' });
    expect(sessions.findWithOwner).toHaveBeenCalledTimes(1);
    expect(sessions.touch).not.toHaveBeenCalled();
  });

  it('sesión inexistente o de otra persona: UNAUTHENTICATED', async () => {
    await expect(armar(null).useCase.execute('t')).rejects.toBeInstanceOf(DomainError);
    const otra = new Session('s1', 'c1', 'otro', ahora, ahora, new Date(ahora.getTime() + 1000), null);
    await expect(armar({ session: otra, owner: dueno() }).useCase.execute('t')).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });

  it('inactiva: SESSION_EXPIRED y la revoca; revocada: SESSION_EXPIRED sin revocar', async () => {
    const idle = armar({ session: sesion({ last: new Date(ahora.getTime() - 3_600_000) }), owner: dueno() });
    await expect(idle.useCase.execute('t')).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });
    expect(idle.sessions.revoke).toHaveBeenCalledTimes(1);
    const rev = armar({ session: sesion({ revoked: ahora }), owner: dueno() });
    await expect(rev.useCase.execute('t')).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });
    expect(rev.sessions.revoke).not.toHaveBeenCalled();
  });

  it('persona inactiva o ausente: ACCOUNT_INACTIVE y revoca', async () => {
    for (const owner of [dueno('inactive'), null]) {
      const { useCase, sessions } = armar({ session: sesion(), owner });
      await expect(useCase.execute('t')).rejects.toMatchObject({ code: 'ACCOUNT_INACTIVE' });
      expect(sessions.revoke).toHaveBeenCalledTimes(1);
    }
  });

  it('toca la actividad solo si pasó más de un minuto', async () => {
    const { useCase, sessions } = armar({ session: sesion({ last: new Date(ahora.getTime() - 120_000) }), owner: dueno() });
    await useCase.execute('t');
    expect(sessions.touch).toHaveBeenCalledTimes(1);
  });
});
