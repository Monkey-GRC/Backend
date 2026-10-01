import { BUSINESS_MODEL_VALUES, CLIENT_COUNTRY_VALUES, COMPLIANCE_MATURITY_VALUES, INCORPORATION_COUNTRY_VALUES, INDUSTRY_VALUES, REGULATION_CODES, SIZE_VALUES, YEARS_IN_OPERATION_VALUES } from '../../../../common/catalogs/onboarding-catalogs';
export declare class SaveOrganizationalContextDto {
    name?: string;
    description: string;
    size: (typeof SIZE_VALUES)[number];
    industry: (typeof INDUSTRY_VALUES)[number];
    business_model: (typeof BUSINESS_MODEL_VALUES)[number];
    years_in_operation?: (typeof YEARS_IN_OPERATION_VALUES)[number] | null;
    incorporation_countries: (typeof INCORPORATION_COUNTRY_VALUES)[number][];
    client_countries: (typeof CLIENT_COUNTRY_VALUES)[number][];
    compliance_maturity: (typeof COMPLIANCE_MATURITY_VALUES)[number];
    regulation_codes: (typeof REGULATION_CODES)[number][];
}
