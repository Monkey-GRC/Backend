import { ServicePatch } from '../domain/entities/service.entity';
import { ServiceRepository } from '../domain/repositories/service.repository';
export declare function assertServiceInput(services: ServiceRepository, input: Pick<ServicePatch, 'frameworkCodes' | 'regulationCodes'>): Promise<void>;
