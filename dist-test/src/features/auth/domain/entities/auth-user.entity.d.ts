import { UserRole, UserStatus } from '../../../../common/enums/user-role.enum';
export declare const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export declare const LOCKOUT_MINUTES = 15;
export declare class UserCredentials {
    readonly id: string;
    readonly companyId: string;
    readonly passwordHash: string;
    readonly role: UserRole;
    readonly status: UserStatus;
    readonly failedLoginAttempts: number;
    readonly lockedUntil: Date | null;
    constructor(id: string, companyId: string, passwordHash: string, role: UserRole, status: UserStatus, failedLoginAttempts: number, lockedUntil: Date | null);
    isLocked(now: Date): boolean;
    secondsUntilUnlock(now: Date): number;
    afterFailedAttempt(now: Date): {
        failedLoginAttempts: number;
        lockedUntil: Date | null;
    };
}
export declare class AuthUser {
    readonly id: string;
    readonly companyId: string;
    readonly companyName: string;
    readonly email: string;
    readonly name: string;
    readonly lastName: string;
    readonly role: UserRole;
    readonly status: UserStatus;
    readonly isMfaEnabled: boolean;
    readonly lastLoginAt: Date | null;
    readonly createdAt: Date;
    constructor(id: string, companyId: string, companyName: string, email: string, name: string, lastName: string, role: UserRole, status: UserStatus, isMfaEnabled: boolean, lastLoginAt: Date | null, createdAt: Date);
    isActive(): boolean;
}
