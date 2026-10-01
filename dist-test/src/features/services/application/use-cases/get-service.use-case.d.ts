import type { Principal } from '../../../../common/auth/principal';
import { ServiceDetail } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';
export declare class GetServiceUseCase {
    private readonly services;
    constructor(services: ServiceRepository);
    execute(principal: Principal, id: string): Promise<ServiceDetail>;
}
