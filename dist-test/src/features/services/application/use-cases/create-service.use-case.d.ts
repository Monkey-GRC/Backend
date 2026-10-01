import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ServiceDetail, ServiceInput } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';
export declare class CreateServiceUseCase {
    private readonly services;
    private readonly audit;
    constructor(services: ServiceRepository, audit: AuditLogWriter);
    execute(principal: Principal, input: ServiceInput, meta: RequestMeta): Promise<ServiceDetail>;
}
