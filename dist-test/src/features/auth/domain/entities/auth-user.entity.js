"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUser = exports.UserCredentials = exports.LOCKOUT_MINUTES = exports.MAX_FAILED_LOGIN_ATTEMPTS = void 0;
exports.MAX_FAILED_LOGIN_ATTEMPTS = 5;
exports.LOCKOUT_MINUTES = 15;
class UserCredentials {
    id;
    companyId;
    passwordHash;
    role;
    status;
    failedLoginAttempts;
    lockedUntil;
    constructor(id, companyId, passwordHash, role, status, failedLoginAttempts, lockedUntil) {
        this.id = id;
        this.companyId = companyId;
        this.passwordHash = passwordHash;
        this.role = role;
        this.status = status;
        this.failedLoginAttempts = failedLoginAttempts;
        this.lockedUntil = lockedUntil;
    }
    isLocked(now) {
        return this.lockedUntil !== null && this.lockedUntil > now;
    }
    secondsUntilUnlock(now) {
        return this.lockedUntil
            ? Math.max(0, Math.ceil((this.lockedUntil.getTime() - now.getTime()) / 1000))
            : 0;
    }
    afterFailedAttempt(now) {
        const attempts = this.failedLoginAttempts + 1;
        if (attempts >= exports.MAX_FAILED_LOGIN_ATTEMPTS) {
            return {
                failedLoginAttempts: 0,
                lockedUntil: new Date(now.getTime() + exports.LOCKOUT_MINUTES * 60_000),
            };
        }
        return { failedLoginAttempts: attempts, lockedUntil: null };
    }
}
exports.UserCredentials = UserCredentials;
class AuthUser {
    id;
    companyId;
    companyName;
    email;
    name;
    lastName;
    role;
    status;
    isMfaEnabled;
    lastLoginAt;
    createdAt;
    constructor(id, companyId, companyName, email, name, lastName, role, status, isMfaEnabled, lastLoginAt, createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.companyName = companyName;
        this.email = email;
        this.name = name;
        this.lastName = lastName;
        this.role = role;
        this.status = status;
        this.isMfaEnabled = isMfaEnabled;
        this.lastLoginAt = lastLoginAt;
        this.createdAt = createdAt;
    }
    isActive() {
        return this.status === 'active';
    }
}
exports.AuthUser = AuthUser;
//# sourceMappingURL=auth-user.entity.js.map