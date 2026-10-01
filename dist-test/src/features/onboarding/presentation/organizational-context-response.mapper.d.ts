import { OrganizationalContext } from '../domain/entities/organizational-context.entity';
export declare function toOrganizationalContextResponse(ctx: OrganizationalContext): {
    id: string | null;
    name: string;
    description: string | null;
    size: "from_51_to_200" | "from_10_to_50" | "from_201_to_500" | "from_501_to_1000" | "from_1001_to_2000" | "from_2001_to_5000" | "more_than_5000" | null;
    industry: "other" | "healthcare" | "government" | "education" | "manufacturing" | "telecommunications" | "logistics" | "financial_banking" | "fintech" | "technology_saas" | "bpo_outsourcing" | "retail_ecommerce" | "insurance" | "energy_utilities" | null;
    business_model: "data_center" | "service_desk" | "consulting" | "other" | "healthcare" | "government" | "manufacturing" | "telecommunications" | "logistics" | "insurance" | "bpo_kpo_ito" | "call_contact_center" | "ai_ml" | "saas_paas_iaas" | "fintech_payments" | "banking" | "marketplace_ecommerce" | "software_factory" | "edtech" | null;
    years_in_operation: "less_than_1" | "from_1_to_3" | "from_3_to_5" | "from_5_to_10" | "more_than_10" | null;
    incorporation_countries: ("other" | "co" | "mx" | "pe" | "cl" | "ar" | "br" | "ec" | "cr" | "pa" | "us" | "es")[];
    client_countries: ("other" | "co" | "mx" | "pe" | "cl" | "ar" | "br" | "ec" | "cr" | "pa" | "us" | "es" | "eu")[];
    compliance_maturity: "none" | "initial_ad_hoc" | "implementing" | "defined" | "managed_certified" | null;
    regulations: import("../domain/entities/organizational-context.entity").RegulationRef[];
    completion: {
        required_total: number;
        required_filled: number;
        optional_total: number;
        optional_filled: number;
    };
    is_complete: boolean;
};
