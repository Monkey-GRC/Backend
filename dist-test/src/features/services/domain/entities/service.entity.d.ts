import { ActiveClientCount, DataType, ExpectedAvailability, PreviousCertification, ServedIndustry, ServiceCountry, ServiceType, SubserviceType, TrustCriterionValue } from '../../../../common/catalogs/service-catalogs';
export type SubserviceInput = {
    type: SubserviceType;
    provider: string | null;
    serviceProvided: string | null;
    responsibility: string | null;
};
export type SystemDescriptionInput = {
    kind: 'link';
    url: string;
};
export type ServiceInput = {
    name: string;
    description: string;
    scopeStatement: string;
    type: ServiceType;
    industriesServed: ServedIndustry[];
    activeClientCount: ActiveClientCount | null;
    countries: ServiceCountry[];
    dataTypes: DataType[];
    trustCriteria: TrustCriterionValue[];
    subserviceOrganizations: SubserviceInput[];
    frameworkCodes: string[];
    regulationCodes: string[];
    previousCertification: PreviousCertification | null;
    expectedAvailability: ExpectedAvailability;
    systemDescription: SystemDescriptionInput;
};
export type ServicePatch = Partial<ServiceInput>;
export type ServiceFrameworkRef = {
    code: string;
    name: string;
    contractedAt: string;
    status: string;
    catalogVersion: number;
    evaluationPeriod: string;
};
export type ServiceRegulationRef = {
    code: string;
    name: string;
    jurisdiction: string;
};
export type SubserviceView = SubserviceInput & {
    id: string;
};
export type SystemDescriptionView = {
    id: string;
    kind: 'link' | 'file';
    url: string;
    sections: unknown[];
};
export type CatalogSummary = {
    status: 'ready';
    applicableRequirements: number;
    clonedControls: number;
};
export type ServiceData = {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    scopeStatement: string;
    type: ServiceType;
    industriesServed: ServedIndustry[];
    activeClientCount: ActiveClientCount | null;
    countries: ServiceCountry[];
    dataTypes: DataType[];
    trustCriteria: TrustCriterionValue[];
    subserviceOrganizations: SubserviceView[];
    frameworks: ServiceFrameworkRef[];
    regulations: ServiceRegulationRef[];
    previousCertification: PreviousCertification | null;
    expectedAvailability: ExpectedAvailability;
    systemDescription: SystemDescriptionView | null;
    catalog: CatalogSummary;
    deploymentScenario: string | null;
    hasScope: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export declare class ServiceDetail {
    readonly data: ServiceData;
    constructor(data: ServiceData);
    get id(): string;
    get completion(): {
        required_total: number;
        required_filled: number;
        optional_total: number;
        optional_filled: number;
    };
    get isComplete(): boolean;
    get technicalControlDone(): boolean;
    snapshot(): Record<string, unknown>;
}
