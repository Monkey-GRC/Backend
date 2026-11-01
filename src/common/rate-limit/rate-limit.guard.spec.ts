import type { ExecutionContext } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { DomainError } from '../errors/domain-error';
import { RateLimitGuard } from './rate-limit.guard';

const config = (values: Record<string, string>) => ({ get: (key: string) => values[key] }) as unknown as ConfigService;

function contextFor(principal: { userId: string; companyId: string } | undefined) {
  const headers: Record<string, string> = {};
  const context = {
    switchToHttp: () => ({
      getRequest: () => ({ principal }),
      getResponse: () => ({ setHeader: (name: string, value: string) => (headers[name] = value) }),
    }),
  } as unknown as ExecutionContext;
  return { context, headers };
}

const as = (userId: string, companyId: string) => contextFor({ userId, companyId });
const codeOf = (fn: () => unknown): string | undefined => {
  try {
    fn();
  } catch (error) {
    return (error as DomainError).code;
  }
  return undefined;
};

describe('RateLimitGuard (SEG-19)', () => {
  it('por defecto son 100 por minuto por usuario y 1000 por empresa', () => {
    const guard = new RateLimitGuard(config({}));
    for (let i = 0; i < 100; i += 1) expect(guard.canActivate(as('u1', 'c1').context)).toBe(true);
    expect(codeOf(() => guard.canActivate(as('u1', 'c1').context))).toBe('RATE_LIMITED');
  });

  it('al pasarse del tope de usuario, responde RATE_LIMITED con Retry-After, y otro usuario sigue entrando', () => {
    const guard = new RateLimitGuard(config({ RATE_LIMIT_USER_PER_MINUTE: '3' }));
    for (let i = 0; i < 3; i += 1) guard.canActivate(as('u1', 'c1').context);
    const blocked = as('u1', 'c1');
    let details: unknown;
    try {
      guard.canActivate(blocked.context);
    } catch (error) {
      details = (error as DomainError).details;
    }
    expect(details).toMatchObject({ retry_after_seconds: expect.any(Number) });
    expect(Number(blocked.headers['Retry-After'])).toBeGreaterThanOrEqual(1);
    expect(Number(blocked.headers['Retry-After'])).toBeLessThanOrEqual(60);
    expect(guard.canActivate(as('u2', 'c1').context)).toBe(true);
  });

  it('el tope de empresa suma a todos sus usuarios, aunque ninguno pase el suyo', () => {
    const guard = new RateLimitGuard(config({ RATE_LIMIT_USER_PER_MINUTE: '100', RATE_LIMIT_COMPANY_PER_MINUTE: '4' }));
    guard.canActivate(as('u1', 'c1').context);
    guard.canActivate(as('u1', 'c1').context);
    guard.canActivate(as('u2', 'c1').context);
    guard.canActivate(as('u3', 'c1').context);
    expect(codeOf(() => guard.canActivate(as('u4', 'c1').context))).toBe('RATE_LIMITED');
    // Otra empresa no se entera.
    expect(guard.canActivate(as('u9', 'c2').context)).toBe(true);
  });

  it('una petición rechazada no gasta cupo: tras rechazar a un usuario, los demás conservan el suyo', () => {
    const guard = new RateLimitGuard(config({ RATE_LIMIT_USER_PER_MINUTE: '1', RATE_LIMIT_COMPANY_PER_MINUTE: '3' }));
    guard.canActivate(as('u1', 'c1').context);
    for (let i = 0; i < 10; i += 1) expect(codeOf(() => guard.canActivate(as('u1', 'c1').context))).toBe('RATE_LIMITED');
    expect(guard.canActivate(as('u2', 'c1').context)).toBe(true);
    expect(guard.canActivate(as('u3', 'c1').context)).toBe(true);
  });

  it('sin sesión (rutas públicas) no cuenta ni bloquea', () => {
    const guard = new RateLimitGuard(config({ RATE_LIMIT_USER_PER_MINUTE: '1', RATE_LIMIT_COMPANY_PER_MINUTE: '1' }));
    for (let i = 0; i < 20; i += 1) expect(guard.canActivate(contextFor(undefined).context)).toBe(true);
  });

  it('un tope mal configurado impide arrancar en vez de limitar mal en silencio', () => {
    expect(() => new RateLimitGuard(config({ RATE_LIMIT_USER_PER_MINUTE: 'cien' }))).toThrow('RATE_LIMIT_USER_PER_MINUTE');
    expect(() => new RateLimitGuard(config({ RATE_LIMIT_COMPANY_PER_MINUTE: '0' }))).toThrow('RATE_LIMIT_COMPANY_PER_MINUTE');
  });
});
