import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { AccessKey } from '../../domain/entities/access-key.entity';
import { Company } from '../../domain/entities/company.entity';
import { CompanyRepository } from '../../domain/repositories/company.repository';
export type RegisterCompanyInput = {
    name: string;
    requiresDedicatedDatabase: boolean;
    adminEmail: string;
};
export type RegisterCompanyResult = {
    company: Company;
    accessKey: AccessKey;
    accessKeyCode: string;
};
export declare class RegisterCompanyUseCase {
    private readonly companies;
    private readonly tokens;
    private readonly audit;
    private readonly accessKeyTtlHours;
    constructor(companies: CompanyRepository, tokens: TokenHasher, audit: AuditLogWriter, accessKeyTtlHours: number);
    execute(principal: Principal, input: RegisterCompanyInput, meta: RequestMeta): Promise<RegisterCompanyResult>;
}
