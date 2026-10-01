import { TransactionClient } from '../../../infrastructure/database/prisma.service';
type CloneRequest = {
    tenantId: string;
    serviceId: string;
    frameworkId: string;
    trustCriterionIds: string[];
    evaluationPeriod: string;
};
type ControlKind = 'manual' | 'automated' | 'hybrid' | 'technical_manual';
export declare function controlKind(types: ControlKind[]): ControlKind;
export declare class CatalogCloner {
    cloneFramework(tx: TransactionClient, req: CloneRequest): Promise<void>;
    private cloneControls;
    private cloneRisksAndCauses;
    private cloneMissing;
}
export {};
