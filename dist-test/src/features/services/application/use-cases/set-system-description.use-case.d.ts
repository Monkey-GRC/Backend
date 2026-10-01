import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ServiceDetail, SystemDescriptionInput } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';
export declare class SetSystemDescriptionUseCase {
    private readonly services;
    private readonly audit;
    constructor(services: ServiceRepository, audit: AuditLogWriter);
    execute(principal: Principal, id: string, input: SystemDescriptionInput, meta: RequestMeta): Promise<ServiceDetail>;
}
