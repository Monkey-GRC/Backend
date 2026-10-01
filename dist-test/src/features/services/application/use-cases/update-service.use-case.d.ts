import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ServiceDetail, ServicePatch } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';
export declare class UpdateServiceUseCase {
    private readonly services;
    private readonly audit;
    constructor(services: ServiceRepository, audit: AuditLogWriter);
    execute(principal: Principal, id: string, patch: ServicePatch, meta: RequestMeta): Promise<ServiceDetail>;
}
