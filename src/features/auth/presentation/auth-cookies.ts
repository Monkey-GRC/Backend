import { CookieOptions, Request, Response } from 'express';
import { RequestMeta } from '../../../common/http/request-meta';

// Auth por cookie httpOnly (conventions.md): el frontend nunca toca los tokens.
export const ACCESS_COOKIE = 'mnk_access';
export const REFRESH_COOKIE = 'mnk_refresh';
// El refresh token solo viaja a los endpoints de auth, no en cada request.
const REFRESH_PATH = '/v1/auth';

const base = (): CookieOptions => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
});

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  accessTtlSeconds: number,
  sessionExpiresAt: Date,
): void {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...base(),
    path: '/',
    maxAge: accessTtlSeconds * 1000,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...base(),
    path: REFRESH_PATH,
    maxAge: Math.max(0, sessionExpiresAt.getTime() - Date.now()),
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { ...base(), path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...base(), path: REFRESH_PATH });
}

export function readCookie(req: Request, name: string): string | undefined {
  const value = (req.cookies as Record<string, unknown> | undefined)?.[name];
  return typeof value === 'string' && value ? value : undefined;
}

export function requestMeta(req: Request): RequestMeta {
  return {
    ipAddress: req.ip ?? '',
    userAgent: req.get('user-agent') ?? '',
  };
}
