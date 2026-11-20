import { CookieOptions, Request, Response } from 'express';
import { RequestMeta } from '../../../common/http/request-meta';
import { clientIp } from '../../../common/http/client-ip';

// Auth por cookie httpOnly (conventions.md): el frontend nunca toca los tokens.
// Admin y Platform comparten host de API y navegador: sin juegos de cookies distintos, iniciar sesión en una pisaría la sesión de la otra.
// El header `X-Monkey-Client` solo elige QUÉ cookie leer o escribir; no autentica nada ni se guarda.
export type CookieNames = { access: string; refresh: string; mfa: string };
export const CLIENT_HEADER = 'x-monkey-client';
const PLATFORM_COOKIES: CookieNames = { access: 'mnk_access', refresh: 'mnk_refresh', mfa: 'mnk_mfa' };
const ADMIN_COOKIES: CookieNames = { access: 'mnka_access', refresh: 'mnka_refresh', mfa: 'mnka_mfa' };

export function isAdminClient(req: Request): boolean {
  return req.get(CLIENT_HEADER)?.trim().toLowerCase() === 'admin';
}

// D94 · `mfa` es el desafío del segundo factor (entre la contraseña y la sesión): dura lo que el desafío y la persona nunca lo ve.
export function cookieNames(req: Request): CookieNames {
  return isAdminClient(req) ? ADMIN_COOKIES : PLATFORM_COOKIES;
}

// El refresh token solo viaja a los endpoints de auth, no en cada request.
const REFRESH_PATH = '/v1/auth';
const MFA_PATH = '/v1/auth/mfa';

const base = (): CookieOptions => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
});

export function setAuthCookies(
  req: Request,
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  accessTtlSeconds: number,
  sessionExpiresAt: Date,
): void {
  const names = cookieNames(req);
  res.cookie(names.access, tokens.accessToken, {
    ...base(),
    path: '/',
    maxAge: accessTtlSeconds * 1000,
  });
  res.cookie(names.refresh, tokens.refreshToken, {
    ...base(),
    path: REFRESH_PATH,
    maxAge: Math.max(0, sessionExpiresAt.getTime() - Date.now()),
  });
}

export function setMfaChallengeCookie(req: Request, res: Response, token: string, expiresAt: Date): void {
  res.cookie(cookieNames(req).mfa, token, { ...base(), path: MFA_PATH, maxAge: Math.max(0, expiresAt.getTime() - Date.now()) });
}

export function clearMfaChallengeCookie(req: Request, res: Response): void {
  res.clearCookie(cookieNames(req).mfa, { ...base(), path: MFA_PATH });
}

// D123 · «Recordar este dispositivo»: una sola cookie por navegador y siempre con este nombre. Monkey Admin comparte host y la cookie viaja en sus peticiones,
// pero no es suya: con `X-Monkey-Client: admin` la API ni la lee, ni la escribe, ni la borra (MD-489).
// Escribir una nueva pisa la anterior. Vive en la misma ruta que el refresh: solo viaja a los endpoints de auth.
export const DEVICE_COOKIE = 'mnk_device';
export const DEVICE_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function setDeviceCookie(req: Request, res: Response, token: string): void {
  if (isAdminClient(req)) return;
  res.cookie(DEVICE_COOKIE, token, { ...base(), path: REFRESH_PATH, maxAge: DEVICE_COOKIE_MAX_AGE_MS });
}

export function clearDeviceCookie(req: Request, res: Response): void {
  if (isAdminClient(req)) return;
  res.clearCookie(DEVICE_COOKIE, { ...base(), path: REFRESH_PATH });
}

export function clearAuthCookies(req: Request, res: Response): void {
  const names = cookieNames(req);
  res.clearCookie(names.access, { ...base(), path: '/' });
  res.clearCookie(names.refresh, { ...base(), path: REFRESH_PATH });
}

function readCookie(req: Request, name: string): string | undefined {
  const value = (req.cookies as Record<string, unknown> | undefined)?.[name];
  return typeof value === 'string' && value ? value : undefined;
}

export const readAccessCookie = (req: Request) => readCookie(req, cookieNames(req).access);
export const readRefreshCookie = (req: Request) => readCookie(req, cookieNames(req).refresh);
export const readDeviceCookie = (req: Request) => (isAdminClient(req) ? undefined : readCookie(req, DEVICE_COOKIE));
export const readMfaCookie = (req: Request) => readCookie(req, cookieNames(req).mfa);

export function requestMeta(req: Request): RequestMeta {
  return {
    ipAddress: clientIp(req),
    userAgent: req.get('user-agent') ?? '',
  };
}
