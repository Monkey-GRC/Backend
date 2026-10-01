import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DeploymentScenarioValue } from '../../../../common/catalogs/technical-catalogs';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ScopeCounts, TechnicalControlState } from '../../domain/entities/technical-control.entities';
import { TechnicalControlRepository } from '../../domain/repositories/technical-control.repository';
export declare class GetTechnicalControlUseCase {
    private readonly repo;
    constructor(repo: TechnicalControlRepository);
    execute(principal: Principal, serviceId: string): Promise<TechnicalControlState>;
}
export declare class SetDeploymentScenarioUseCase {
    private readonly repo;
    private readonly audit;
    constructor(repo: TechnicalControlRepository, audit: AuditLogWriter);
    execute(principal: Principal, serviceId: string, scenario: DeploymentScenarioValue, meta: RequestMeta): Promise<TechnicalControlState>;
}
export declare class SetScopeUseCase {
    private readonly repo;
    private readonly audit;
    constructor(repo: TechnicalControlRepository, audit: AuditLogWriter);
    execute(principal: Principal, serviceId: string, counts: ScopeCounts, meta: RequestMeta): Promise<TechnicalControlState>;
}
