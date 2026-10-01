export type AccessKeyStatus = 'pending' | 'used' | 'expired' | 'revoked';
export declare class AccessKey {
    readonly id: string;
    readonly companyId: string;
    readonly status: AccessKeyStatus;
    readonly expiresAt: Date;
    readonly usedAt: Date | null;
    constructor(id: string, companyId: string, status: AccessKeyStatus, expiresAt: Date, usedAt: Date | null);
    statusAt(now: Date): AccessKeyStatus;
}
