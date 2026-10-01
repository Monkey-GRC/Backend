import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { ConnectionCategory, ScheduleFrequencyValue } from '../../../../common/catalogs/technical-catalogs';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page, PageRequest } from '../../../../common/pagination/page';
import { CredentialCipher } from '../../../../common/security/credential-cipher';
import { Asset, AssetFilters } from '../../domain/entities/technical-control.entities';
import { ConnectionProbe } from '../../domain/ports/connection-probe';
import { TechnicalControlRepository } from '../../domain/repositories/technical-control.repository';
export type NewAssetRequest = {
    name: string;
    connectionCategory: ConnectionCategory;
    platform: string;
    ipAddress: string | null;
    location: string | null;
    criticality?: string;
    tags?: string[];
    serviceIds: string[];
    responsibleId: string | null;
    credentials?: Record<string, unknown>;
};
export declare class CreateAssetUseCase {
    private readonly repo;
    private readonly cipher;
    private readonly audit;
    constructor(repo: TechnicalControlRepository, cipher: CredentialCipher, audit: AuditLogWriter);
    execute(principal: Principal, request: NewAssetRequest, meta: RequestMeta): Promise<Asset>;
}
export declare class ListAssetsUseCase {
    private readonly repo;
    constructor(repo: TechnicalControlRepository);
    execute(principal: Principal, filters: AssetFilters, page: PageRequest): Promise<Page<Asset>>;
}
export declare class GetAssetUseCase {
    private readonly repo;
    constructor(repo: TechnicalControlRepository);
    execute(principal: Principal, id: string): Promise<Asset>;
}
export type ValidationOutcome = {
    asset: Asset;
    checksAvailable: number;
};
export declare class ValidateAssetUseCase {
    private readonly repo;
    private readonly probe;
    private readonly cipher;
    private readonly audit;
    constructor(repo: TechnicalControlRepository, probe: ConnectionProbe, cipher: CredentialCipher, audit: AuditLogWriter);
    execute(principal: Principal, id: string, meta: RequestMeta): Promise<ValidationOutcome>;
}
export declare class ActivateAssetUseCase {
    private readonly repo;
    private readonly probe;
    private readonly audit;
    constructor(repo: TechnicalControlRepository, probe: ConnectionProbe, audit: AuditLogWriter);
    execute(principal: Principal, id: string, meta: RequestMeta): Promise<Asset>;
}
export declare class ScheduleAssetUseCase {
    private readonly repo;
    private readonly audit;
    constructor(repo: TechnicalControlRepository, audit: AuditLogWriter);
    execute(principal: Principal, id: string, frequency: ScheduleFrequencyValue, meta: RequestMeta): Promise<Asset>;
}
