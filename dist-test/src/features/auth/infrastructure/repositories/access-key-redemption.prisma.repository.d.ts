import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { RedeemableAccessKey, RedeemingCompany } from '../../domain/entities/redeemable-access-key.entity';
import { AccessKeyRedemptionRepository, NewCompanyAdmin, RedeemOutcome } from '../../domain/repositories/access-key-redemption.repository';
export declare class AccessKeyRedemptionPrismaRepository extends AccessKeyRedemptionRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByCodeHash(codeHash: string): Promise<RedeemableAccessKey | null>;
    findCompany(scope: TenantScope): Promise<RedeemingCompany | null>;
    redeem(scope: TenantScope, accessKeyId: string, admin: NewCompanyAdmin, at: Date): Promise<RedeemOutcome>;
}
