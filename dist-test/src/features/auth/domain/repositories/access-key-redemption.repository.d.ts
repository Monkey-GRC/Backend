import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { RedeemableAccessKey, RedeemingCompany } from '../entities/redeemable-access-key.entity';
export type NewCompanyAdmin = {
    email: string;
    name: string;
    lastName: string;
    passwordHash: string;
};
export type RedeemOutcome = {
    kind: 'created';
    userId: string;
} | {
    kind: 'already_used';
} | {
    kind: 'email_taken';
};
export declare abstract class AccessKeyRedemptionRepository {
    abstract findByCodeHash(codeHash: string): Promise<RedeemableAccessKey | null>;
    abstract findCompany(scope: TenantScope): Promise<RedeemingCompany | null>;
    abstract redeem(scope: TenantScope, accessKeyId: string, admin: NewCompanyAdmin, at: Date): Promise<RedeemOutcome>;
}
