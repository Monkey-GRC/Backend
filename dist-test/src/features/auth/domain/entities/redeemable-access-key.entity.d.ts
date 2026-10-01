export type RedeemState = 'redeemable' | 'used' | 'expired' | 'revoked';
export declare class RedeemableAccessKey {
    readonly id: string;
    readonly companyId: string;
    readonly status: 'pending' | 'used' | 'expired' | 'revoked';
    readonly expiresAt: Date;
    readonly usedAt: Date | null;
    constructor(id: string, companyId: string, status: 'pending' | 'used' | 'expired' | 'revoked', expiresAt: Date, usedAt: Date | null);
    stateAt(now: Date): RedeemState;
}
export type RedeemingCompany = {
    id: string;
    name: string;
    adminEmail: string;
    status: 'active' | 'suspended';
};
