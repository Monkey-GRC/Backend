import type { CookieOptions, Response } from 'express';
import { ACCESS_COOKIE, clearAuthCookies, clearMfaChallengeCookie, MFA_COOKIE, REFRESH_COOKIE, setAuthCookies, setMfaChallengeCookie } from './auth-cookies';

// SEG-18 · Los tokens viajan en cookies `httpOnly` y el frontend nunca los toca. La bandera `Secure` solo se enciende en producción (en local no hay HTTPS): aquí se prueba
// que en producción SÍ va en todas, también al borrarlas, y que fuera de producción no se pone para no romper el desarrollo.
type Written = { name: string; value?: string; options: CookieOptions };

function fakeResponse(): { res: Response; set: Written[]; cleared: Written[] } {
  const set: Written[] = [];
  const cleared: Written[] = [];
  const res = {
    cookie: (name: string, value: string, options: CookieOptions) => set.push({ name, value, options }),
    clearCookie: (name: string, options: CookieOptions) => cleared.push({ name, options }),
  } as unknown as Response;
  return { res, set, cleared };
}

const tokens = { accessToken: 'a.b.c', refreshToken: 'opaque-refresh' };
const expiresAt = () => new Date(Date.now() + 60 * 60_000);

function writeAll() {
  const { res, set, cleared } = fakeResponse();
  setAuthCookies(res, tokens, 900, expiresAt());
  setMfaChallengeCookie(res, 'challenge', expiresAt());
  clearAuthCookies(res);
  clearMfaChallengeCookie(res);
  return { set, cleared };
}

describe('cookies de sesión (SEG-18)', () => {
  const original = process.env['NODE_ENV'];
  afterEach(() => {
    process.env['NODE_ENV'] = original;
  });

  it('en producción TODAS las cookies llevan Secure, HttpOnly y SameSite=Lax, al escribirlas y al borrarlas', () => {
    process.env['NODE_ENV'] = 'production';
    const { set, cleared } = writeAll();
    expect(set.map((c) => c.name)).toEqual([ACCESS_COOKIE, REFRESH_COOKIE, MFA_COOKIE]);
    expect(cleared.map((c) => c.name)).toEqual([ACCESS_COOKIE, REFRESH_COOKIE, MFA_COOKIE]);
    for (const cookie of [...set, ...cleared]) {
      expect(cookie.options).toMatchObject({ secure: true, httpOnly: true, sameSite: 'lax' });
    }
  });

  it('fuera de producción no se pide HTTPS (si no, el desarrollo local no podría iniciar sesión)', () => {
    process.env['NODE_ENV'] = 'development';
    const { set, cleared } = writeAll();
    for (const cookie of [...set, ...cleared]) expect(cookie.options).toMatchObject({ secure: false, httpOnly: true, sameSite: 'lax' });
  });

  it('el refresh solo viaja a /v1/auth y el desafío del segundo factor solo a /v1/auth/mfa; el de acceso, a toda la API', () => {
    const { set } = writeAll();
    const pathOf = (name: string) => set.find((c) => c.name === name)?.options.path;
    expect(pathOf(ACCESS_COOKIE)).toBe('/');
    expect(pathOf(REFRESH_COOKIE)).toBe('/v1/auth');
    expect(pathOf(MFA_COOKIE)).toBe('/v1/auth/mfa');
  });

  it('al borrar una cookie se usa la misma ruta con la que se escribió; si no, el navegador no la quita', () => {
    const { set, cleared } = writeAll();
    for (const gone of cleared) expect(gone.options.path).toBe(set.find((c) => c.name === gone.name)?.options.path);
  });
});
