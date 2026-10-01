export type SessionPolicy = {
    accessTokenTtl: number;
    idleTimeout: number;
    maxDuration: number;
};
export type SessionState = 'active' | 'revoked' | 'idle' | 'expired';
export declare class Session {
    readonly id: string;
    readonly companyId: string;
    readonly userId: string;
    readonly createdAt: Date;
    readonly lastActivityAt: Date;
    readonly expiresAt: Date;
    readonly revokedAt: Date | null;
    constructor(id: string, companyId: string, userId: string, createdAt: Date, lastActivityAt: Date, expiresAt: Date, revokedAt: Date | null);
    stateAt(now: Date, policy: SessionPolicy): SessionState;
    static expiresAtFor(createdAt: Date, policy: SessionPolicy): Date;
}
