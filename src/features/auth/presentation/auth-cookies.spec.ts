import type { CookieOptions, Request, Response } from 'express';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  clearAuthCookies,
  clearDeviceCookie,
  readDeviceCookie,
  setDeviceCookie,
  clearMfaChallengeCookie,
  cookieNames,
  readAccessCookie,
  readMfaCookie,
  readRefreshCookie,
  setAuthCookies,
  setMfaChallengeCookie,
} from './auth-cookies';
import { SessionAuthGuard } from './guards/session-auth.guard';
import type { ValidateSessionUseCase } from '../application/use-cases/session/validate-session.use-case';

const ACCESS_COOKIE = 'mnk_access';
const REFRESH_COOKIE = 'mnk_refresh';
const MFA_COOKIE = 'mnk_mfa';

function fakeRequest(
  client?: string,
  cookies: Record<string, string> = {},
): Request {
  return {
    cookies,
    get: (h: string) =>
      h.toLowerCase() === 'x-monkey-client' ? client : undefined,
  } as unknown as Request;
}

// SEG-18 · Los tokens viajan en cookies `httpOnly` y el frontend nunca los toca. La bandera `Secure` solo se enciende en producción (en local no hay HTTPS): aquí se prueba
// que en producción SÍ va en todas, también al borrarlas, y que fuera de producción no se pone para no romper el desarrollo.
type Written = { name: string; value?: string; options: CookieOptions };

function fakeResponse(): { res: Response; set: Written[]; cleared: Written[] } {
  const set: Written[] = [];
  const cleared: Written[] = [];
  const res = {
    cookie: (name: string, value: string, options: CookieOptions) =>
      set.push({ name, value, options }),
    clearCookie: (name: string, options: CookieOptions) =>
      cleared.push({ name, options }),
  } as unknown as Response;
  return { res, set, cleared };
}

const tokens = { accessToken: 'a.b.c', refreshToken: 'opaque-refresh' };
const expiresAt = () => new Date(Date.now() + 60 * 60_000);

function writeAll(client?: string) {
  const req = fakeRequest(client);
  const { res, set, cleared } = fakeResponse();
  setAuthCookies(req, res, tokens, 900, expiresAt());
  setMfaChallengeCookie(req, res, 'challenge', expiresAt());
  clearAuthCookies(req, res);
  clearMfaChallengeCookie(req, res);
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
    expect(set.map((c) => c.name)).toEqual([
      ACCESS_COOKIE,
      REFRESH_COOKIE,
      MFA_COOKIE,
    ]);
    expect(cleared.map((c) => c.name)).toEqual([
      ACCESS_COOKIE,
      REFRESH_COOKIE,
      MFA_COOKIE,
    ]);
    for (const cookie of [...set, ...cleared]) {
      expect(cookie.options).toMatchObject({
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
      });
    }
  });

  it('fuera de producción no se pide HTTPS (si no, el desarrollo local no podría iniciar sesión)', () => {
    process.env['NODE_ENV'] = 'development';
    const { set, cleared } = writeAll();
    for (const cookie of [...set, ...cleared])
      expect(cookie.options).toMatchObject({
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
      });
  });

  it('el refresh solo viaja a /v1/auth y el desafío del segundo factor solo a /v1/auth/mfa; el de acceso, a toda la API', () => {
    const { set } = writeAll();
    const pathOf = (name: string) =>
      set.find((c) => c.name === name)?.options.path;
    expect(pathOf(ACCESS_COOKIE)).toBe('/');
    expect(pathOf(REFRESH_COOKIE)).toBe('/v1/auth');
    expect(pathOf(MFA_COOKIE)).toBe('/v1/auth/mfa');
  });

  it('al borrar una cookie se usa la misma ruta con la que se escribió; si no, el navegador no la quita', () => {
    const { set, cleared } = writeAll();
    for (const gone of cleared)
      expect(gone.options.path).toBe(
        set.find((c) => c.name === gone.name)?.options.path,
      );
  });

  it('el header admin usa mnka_*; ausente, platform o desconocido usan mnk_*', () => {
    expect(cookieNames(fakeRequest('admin'))).toEqual({
      access: 'mnka_access',
      refresh: 'mnka_refresh',
      mfa: 'mnka_mfa',
    });
    for (const client of [undefined, 'platform', 'otro']) {
      expect(cookieNames(fakeRequest(client))).toEqual({
        access: 'mnk_access',
        refresh: 'mnk_refresh',
        mfa: 'mnk_mfa',
      });
    }
  });

  it('con admin escribe y borra solo las cookies mnka_*, con las mismas rutas', () => {
    const { set, cleared } = writeAll('admin');
    expect(set.map((c) => c.name)).toEqual([
      'mnka_access',
      'mnka_refresh',
      'mnka_mfa',
    ]);
    expect(cleared.map((c) => c.name)).toEqual([
      'mnka_access',
      'mnka_refresh',
      'mnka_mfa',
    ]);
  });

  it('clearAuthCookies borra las del cliente correcto y no toca las del otro', () => {
    const { res, cleared } = fakeResponse();
    clearAuthCookies(fakeRequest('admin'), res);
    expect(cleared.map((c) => c.name)).toEqual(['mnka_access', 'mnka_refresh']);
  });

  it('los lectores leen la cookie del cliente del header e ignoran la del otro', () => {
    const cookies = {
      mnk_access: 'p-a',
      mnk_refresh: 'p-r',
      mnk_mfa: 'p-m',
      mnka_access: 'a-a',
      mnka_refresh: 'a-r',
      mnka_mfa: 'a-m',
    };
    const admin = fakeRequest('admin', cookies);
    const platform = fakeRequest(undefined, cookies);
    expect([
      readAccessCookie(admin),
      readRefreshCookie(admin),
      readMfaCookie(admin),
    ]).toEqual(['a-a', 'a-r', 'a-m']);
    expect([
      readAccessCookie(platform),
      readRefreshCookie(platform),
      readMfaCookie(platform),
    ]).toEqual(['p-a', 'p-r', 'p-m']);
  });

  it('el guard valida la cookie de acceso del cliente del header', async () => {
    const validate = { execute: jest.fn().mockResolvedValue({ userId: 'u' }) };
    const guard = new SessionAuthGuard(
      new Reflector(),
      validate as unknown as ValidateSessionUseCase,
    );
    const req = fakeRequest('admin', {
      mnk_access: 'platform-token',
      mnka_access: 'admin-token',
    });
    const ctx = {
      getHandler: () => function handler() {},
      getClass: () => class Fake {},
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext;
    await guard.canActivate(ctx);
    expect(validate.execute).toHaveBeenCalledWith('admin-token');
  });
});

// MD-217 · D123 · La cookie del dispositivo recordado: siempre `mnk_device` (Admin no la usa), 30 días, solo hacia /v1/auth.
describe('cookie mnk_device (D123, SEG-84)', () => {
  const original = process.env['NODE_ENV'];
  afterEach(() => {
    process.env['NODE_ENV'] = original;
  });

  it.each([
    ['production', true],
    ['development', false],
  ])('en %s: HttpOnly, SameSite=Lax, ruta /v1/auth, 30 días y Secure=%s, al escribirla y al borrarla', (env, secure) => {
    process.env['NODE_ENV'] = env;
    const { res, set, cleared } = fakeResponse();
    setDeviceCookie(fakeRequest(), res, 'token-opaco');
    clearDeviceCookie(fakeRequest(), res);
    expect(set).toHaveLength(1);
    expect(set[0]).toMatchObject({ name: 'mnk_device', value: 'token-opaco' });
    expect(set[0].options).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/v1/auth', maxAge: 30 * 24 * 60 * 60 * 1000 });
    expect(Boolean(set[0].options.secure)).toBe(secure);
    expect(cleared[0].name).toBe('mnk_device');
    expect(cleared[0].options).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/v1/auth' });
    expect(Boolean(cleared[0].options.secure)).toBe(secure);
  });

  it('con el header de Admin no se lee, ni se escribe, ni se borra (MD-489)', () => {
    const { res, set, cleared } = fakeResponse();
    expect(readDeviceCookie(fakeRequest(undefined, { mnk_device: 'x' }))).toBe('x');
    expect(readDeviceCookie(fakeRequest('admin', { mnk_device: 'y' }))).toBeUndefined();
    setDeviceCookie(fakeRequest('admin'), res, 'token');
    clearDeviceCookie(fakeRequest('admin'), res);
    expect(set).toHaveLength(0);
    expect(cleared).toHaveLength(0);
    expect(readDeviceCookie(fakeRequest(undefined, {}))).toBeUndefined();
  });
});
