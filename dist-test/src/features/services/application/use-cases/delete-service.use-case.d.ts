import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ServiceRepository } from '../../domain/repositories/service.repository';
export declare class DeleteServiceUseCase {
    private readonly services;
    private readonly audit;
    constructor(services: ServiceRepository, audit: AuditLogWriter);
    execute(principal: Principal, id: string, meta: RequestMeta): Promise<void>;
}
