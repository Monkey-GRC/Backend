import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { RequestMeta } from '../../../../common/http/request-meta';
import { OrganizationalContext, OrganizationalContextInput } from '../../domain/entities/organizational-context.entity';
import { OrganizationalContextRepository } from '../../domain/repositories/organizational-context.repository';
export declare class SaveOrganizationalContextUseCase {
    private readonly contexts;
    private readonly audit;
    constructor(contexts: OrganizationalContextRepository, audit: AuditLogWriter);
    execute(principal: Principal, input: OrganizationalContextInput, meta: RequestMeta): Promise<OrganizationalContext>;
}
