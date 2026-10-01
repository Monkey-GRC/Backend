import { Request, Response } from 'express';
import { RequestMeta } from '../../../common/http/request-meta';
export declare const ACCESS_COOKIE = "mnk_access";
export declare const REFRESH_COOKIE = "mnk_refresh";
export declare function setAuthCookies(res: Response, tokens: {
    accessToken: string;
    refreshToken: string;
}, accessTtlSeconds: number, sessionExpiresAt: Date): void;
export declare function clearAuthCookies(res: Response): void;
export declare function readCookie(req: Request, name: string): string | undefined;
export declare function requestMeta(req: Request): RequestMeta;
