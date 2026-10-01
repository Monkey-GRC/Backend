"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_COOKIE = exports.ACCESS_COOKIE = void 0;
exports.setAuthCookies = setAuthCookies;
exports.clearAuthCookies = clearAuthCookies;
exports.readCookie = readCookie;
exports.requestMeta = requestMeta;
exports.ACCESS_COOKIE = 'mnk_access';
exports.REFRESH_COOKIE = 'mnk_refresh';
const REFRESH_PATH = '/v1/auth';
const base = () => ({
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
});
function setAuthCookies(res, tokens, accessTtlSeconds, sessionExpiresAt) {
    res.cookie(exports.ACCESS_COOKIE, tokens.accessToken, {
        ...base(),
        path: '/',
        maxAge: accessTtlSeconds * 1000,
    });
    res.cookie(exports.REFRESH_COOKIE, tokens.refreshToken, {
        ...base(),
        path: REFRESH_PATH,
        maxAge: Math.max(0, sessionExpiresAt.getTime() - Date.now()),
    });
}
function clearAuthCookies(res) {
    res.clearCookie(exports.ACCESS_COOKIE, { ...base(), path: '/' });
    res.clearCookie(exports.REFRESH_COOKIE, { ...base(), path: REFRESH_PATH });
}
function readCookie(req, name) {
    const value = req.cookies?.[name];
    return typeof value === 'string' && value ? value : undefined;
}
function requestMeta(req) {
    return {
        ipAddress: req.ip ?? '',
        userAgent: req.get('user-agent') ?? '',
    };
}
//# sourceMappingURL=auth-cookies.js.map