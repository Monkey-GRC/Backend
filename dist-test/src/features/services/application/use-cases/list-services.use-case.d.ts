import type { Principal } from '../../../../common/auth/principal';
import { Page, PageRequest } from '../../../../common/pagination/page';
import { ServiceDetail } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';
export declare class ListServicesUseCase {
    private readonly services;
    constructor(services: ServiceRepository);
    execute(principal: Principal, request: PageRequest): Promise<Page<ServiceDetail>>;
}
