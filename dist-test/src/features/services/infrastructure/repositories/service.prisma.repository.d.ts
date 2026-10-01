import { Page, PageRequest } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ServiceDetail, ServiceInput, ServicePatch, SystemDescriptionInput } from '../../domain/entities/service.entity';
import { Change, ServiceRepository } from '../../domain/repositories/service.repository';
export declare class ServicePrismaRepository extends ServiceRepository {
    private readonly prisma;
    private readonly cloner;
    constructor(prisma: PrismaService);
    existingFrameworkCodes(codes: string[]): Promise<string[]>;
    existingRegulationCodes(codes: string[]): Promise<string[]>;
    create(scope: TenantScope, input: ServiceInput): Promise<ServiceDetail>;
    list(scope: TenantScope, request: PageRequest): Promise<Page<ServiceDetail>>;
    findById(scope: TenantScope, id: string): Promise<ServiceDetail | null>;
    update(scope: TenantScope, id: string, patch: ServicePatch): Promise<Change | null>;
    setSystemDescription(scope: TenantScope, id: string, input: SystemDescriptionInput): Promise<Change | null>;
    remove(scope: TenantScope, id: string): Promise<ServiceDetail | null>;
    private assertNameFree;
    private replaceTrustCriteria;
    private replaceRegulations;
    private syncSubservices;
    private upsertSystemDescription;
    private syncFrameworks;
    private cloneContractedFrameworks;
    private read;
    private readOrNull;
}
