import { REGULATION_CODES } from '../../../../common/catalogs/onboarding-catalogs';
import { ACTIVE_CLIENT_COUNT_VALUES, DATA_TYPE_VALUES, EXPECTED_AVAILABILITY_VALUES, PREVIOUS_CERTIFICATION_VALUES, SERVED_INDUSTRY_VALUES, SERVICE_COUNTRY_VALUES, SERVICE_TYPE_VALUES, SUBSERVICE_TYPE_VALUES, TRUST_CRITERION_VALUES } from '../../../../common/catalogs/service-catalogs';
export declare class SubserviceDto {
    type: (typeof SUBSERVICE_TYPE_VALUES)[number];
    provider?: string | null;
    service_provided?: string | null;
    responsibility?: string | null;
}
export declare class SystemDescriptionDto {
    kind: 'link';
    url: string;
}
export declare class CreateServiceDto {
    name: string;
    description: string;
    scope_statement: string;
    type: (typeof SERVICE_TYPE_VALUES)[number];
    industries_served: (typeof SERVED_INDUSTRY_VALUES)[number][];
    active_client_count?: (typeof ACTIVE_CLIENT_COUNT_VALUES)[number] | null;
    countries: (typeof SERVICE_COUNTRY_VALUES)[number][];
    data_types: (typeof DATA_TYPE_VALUES)[number][];
    trust_criteria: (typeof TRUST_CRITERION_VALUES)[number][];
    subservice_organizations: SubserviceDto[];
    framework_codes: string[];
    regulation_codes: (typeof REGULATION_CODES)[number][];
    previous_certification?: (typeof PREVIOUS_CERTIFICATION_VALUES)[number] | null;
    expected_availability: (typeof EXPECTED_AVAILABILITY_VALUES)[number];
    system_description: SystemDescriptionDto;
}
