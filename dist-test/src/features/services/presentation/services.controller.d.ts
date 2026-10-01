import type { Request } from 'express';
import type { Principal } from '../../../common/auth/principal';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { CreateServiceDto } from '../application/dtos/create-service.dto';
import { ListServicesQuery } from '../application/dtos/list-services.query';
import { SetSystemDescriptionDto } from '../application/dtos/system-description.dto';
import { UpdateServiceDto } from '../application/dtos/update-service.dto';
import { CreateServiceUseCase } from '../application/use-cases/create-service.use-case';
import { DeleteServiceUseCase } from '../application/use-cases/delete-service.use-case';
import { GetServiceUseCase } from '../application/use-cases/get-service.use-case';
import { ListServicesUseCase } from '../application/use-cases/list-services.use-case';
import { SetSystemDescriptionUseCase } from '../application/use-cases/set-system-description.use-case';
import { UpdateServiceUseCase } from '../application/use-cases/update-service.use-case';
export declare class ServicesController {
    private readonly createService;
    private readonly listServices;
    private readonly getService;
    private readonly updateService;
    private readonly deleteService;
    private readonly setSystemDescription;
    constructor(createService: CreateServiceUseCase, listServices: ListServicesUseCase, getService: GetServiceUseCase, updateService: UpdateServiceUseCase, deleteService: DeleteServiceUseCase, setSystemDescription: SetSystemDescriptionUseCase);
    create(principal: Principal, dto: CreateServiceDto, req: Request): Promise<ResponseDto<{
        id: string;
        organization_id: string;
        name: string;
        description: string;
        scope_statement: string;
        type: "saas" | "bpo" | "call_center" | "data_center" | "ai_services" | "specialized_with_data_intervention" | "service_desk" | "managed_services" | "consulting" | "development" | "other";
        industries_served: ("other" | "financial" | "healthcare" | "retail" | "technology" | "government" | "education" | "manufacturing" | "telecommunications" | "energy" | "logistics")[];
        active_client_count: "from_1_to_10" | "from_11_to_50" | "from_51_to_200" | "from_201_to_1000" | "more_than_1000" | null;
        countries: ("gt" | "global" | "co" | "mx" | "pe" | "cl" | "ar" | "br" | "ec" | "uy" | "py" | "bo" | "ve" | "cr" | "pa" | "us" | "ca" | "es" | "pt" | "gb" | "de" | "fr" | "eu" | "latam")[];
        data_types: ("pii" | "payment" | "phi" | "business" | "files" | "logs" | "credentials" | "biometric")[];
        trust_criteria: ("security" | "availability" | "confidentiality" | "integrity" | "privacy")[];
        frameworks: {
            code: string;
            name: string;
            contracted_at: string;
            status: string;
            catalog_version: number;
            evaluation_period: string;
        }[];
        regulations: import("../domain/entities/service.entity").ServiceRegulationRef[];
        subservice_organizations: {
            id: string;
            type: "on_premise" | "hybrid" | "other" | "aws" | "azure" | "gcp" | "mobile";
            provider: string | null;
            service_provided: string | null;
            responsibility: string | null;
        }[];
        previous_certification: "none" | "soc2" | "soc1" | "iso27001" | null;
        expected_availability: "24x7" | "business_hours" | "on_demand" | "not_applicable";
        system_description: import("../domain/entities/service.entity").SystemDescriptionView | null;
        catalog: {
            status: "ready";
            applicable_requirements: number;
            cloned_controls: number;
            message: string;
        };
        completion: {
            required_total: number;
            required_filled: number;
            optional_total: number;
            optional_filled: number;
        };
        is_complete: boolean;
        technical_control: {
            deployment_scenario: string | null;
            has_scope: boolean;
            is_complete: boolean;
        };
        created_at: string;
        updated_at: string;
    }>>;
    list(principal: Principal, query: ListServicesQuery): Promise<ResponseDto<{
        items: {
            id: string;
            name: string;
            type: "saas" | "bpo" | "call_center" | "data_center" | "ai_services" | "specialized_with_data_intervention" | "service_desk" | "managed_services" | "consulting" | "development" | "other";
            is_complete: boolean;
            frameworks: {
                code: string;
                status: string;
            }[];
            catalog: {
                status: "ready";
                cloned_controls: number;
            };
            technical_control: {
                deployment_scenario: string | null;
                has_scope: boolean;
                is_complete: boolean;
            };
            created_at: string;
        }[];
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
    }>>;
    detail(principal: Principal, id: string): Promise<ResponseDto<{
        id: string;
        organization_id: string;
        name: string;
        description: string;
        scope_statement: string;
        type: "saas" | "bpo" | "call_center" | "data_center" | "ai_services" | "specialized_with_data_intervention" | "service_desk" | "managed_services" | "consulting" | "development" | "other";
        industries_served: ("other" | "financial" | "healthcare" | "retail" | "technology" | "government" | "education" | "manufacturing" | "telecommunications" | "energy" | "logistics")[];
        active_client_count: "from_1_to_10" | "from_11_to_50" | "from_51_to_200" | "from_201_to_1000" | "more_than_1000" | null;
        countries: ("gt" | "global" | "co" | "mx" | "pe" | "cl" | "ar" | "br" | "ec" | "uy" | "py" | "bo" | "ve" | "cr" | "pa" | "us" | "ca" | "es" | "pt" | "gb" | "de" | "fr" | "eu" | "latam")[];
        data_types: ("pii" | "payment" | "phi" | "business" | "files" | "logs" | "credentials" | "biometric")[];
        trust_criteria: ("security" | "availability" | "confidentiality" | "integrity" | "privacy")[];
        frameworks: {
            code: string;
            name: string;
            contracted_at: string;
            status: string;
            catalog_version: number;
            evaluation_period: string;
        }[];
        regulations: import("../domain/entities/service.entity").ServiceRegulationRef[];
        subservice_organizations: {
            id: string;
            type: "on_premise" | "hybrid" | "other" | "aws" | "azure" | "gcp" | "mobile";
            provider: string | null;
            service_provided: string | null;
            responsibility: string | null;
        }[];
        previous_certification: "none" | "soc2" | "soc1" | "iso27001" | null;
        expected_availability: "24x7" | "business_hours" | "on_demand" | "not_applicable";
        system_description: import("../domain/entities/service.entity").SystemDescriptionView | null;
        catalog: {
            status: "ready";
            applicable_requirements: number;
            cloned_controls: number;
            message: string;
        };
        completion: {
            required_total: number;
            required_filled: number;
            optional_total: number;
            optional_filled: number;
        };
        is_complete: boolean;
        technical_control: {
            deployment_scenario: string | null;
            has_scope: boolean;
            is_complete: boolean;
        };
        created_at: string;
        updated_at: string;
    }>>;
    update(principal: Principal, id: string, dto: UpdateServiceDto, req: Request): Promise<ResponseDto<{
        id: string;
        organization_id: string;
        name: string;
        description: string;
        scope_statement: string;
        type: "saas" | "bpo" | "call_center" | "data_center" | "ai_services" | "specialized_with_data_intervention" | "service_desk" | "managed_services" | "consulting" | "development" | "other";
        industries_served: ("other" | "financial" | "healthcare" | "retail" | "technology" | "government" | "education" | "manufacturing" | "telecommunications" | "energy" | "logistics")[];
        active_client_count: "from_1_to_10" | "from_11_to_50" | "from_51_to_200" | "from_201_to_1000" | "more_than_1000" | null;
        countries: ("gt" | "global" | "co" | "mx" | "pe" | "cl" | "ar" | "br" | "ec" | "uy" | "py" | "bo" | "ve" | "cr" | "pa" | "us" | "ca" | "es" | "pt" | "gb" | "de" | "fr" | "eu" | "latam")[];
        data_types: ("pii" | "payment" | "phi" | "business" | "files" | "logs" | "credentials" | "biometric")[];
        trust_criteria: ("security" | "availability" | "confidentiality" | "integrity" | "privacy")[];
        frameworks: {
            code: string;
            name: string;
            contracted_at: string;
            status: string;
            catalog_version: number;
            evaluation_period: string;
        }[];
        regulations: import("../domain/entities/service.entity").ServiceRegulationRef[];
        subservice_organizations: {
            id: string;
            type: "on_premise" | "hybrid" | "other" | "aws" | "azure" | "gcp" | "mobile";
            provider: string | null;
            service_provided: string | null;
            responsibility: string | null;
        }[];
        previous_certification: "none" | "soc2" | "soc1" | "iso27001" | null;
        expected_availability: "24x7" | "business_hours" | "on_demand" | "not_applicable";
        system_description: import("../domain/entities/service.entity").SystemDescriptionView | null;
        catalog: {
            status: "ready";
            applicable_requirements: number;
            cloned_controls: number;
            message: string;
        };
        completion: {
            required_total: number;
            required_filled: number;
            optional_total: number;
            optional_filled: number;
        };
        is_complete: boolean;
        technical_control: {
            deployment_scenario: string | null;
            has_scope: boolean;
            is_complete: boolean;
        };
        created_at: string;
        updated_at: string;
    }>>;
    remove(principal: Principal, id: string, req: Request): Promise<ResponseDto<null>>;
    saveSystemDescription(principal: Principal, id: string, dto: SetSystemDescriptionDto, req: Request): Promise<ResponseDto<{
        id: string;
        organization_id: string;
        name: string;
        description: string;
        scope_statement: string;
        type: "saas" | "bpo" | "call_center" | "data_center" | "ai_services" | "specialized_with_data_intervention" | "service_desk" | "managed_services" | "consulting" | "development" | "other";
        industries_served: ("other" | "financial" | "healthcare" | "retail" | "technology" | "government" | "education" | "manufacturing" | "telecommunications" | "energy" | "logistics")[];
        active_client_count: "from_1_to_10" | "from_11_to_50" | "from_51_to_200" | "from_201_to_1000" | "more_than_1000" | null;
        countries: ("gt" | "global" | "co" | "mx" | "pe" | "cl" | "ar" | "br" | "ec" | "uy" | "py" | "bo" | "ve" | "cr" | "pa" | "us" | "ca" | "es" | "pt" | "gb" | "de" | "fr" | "eu" | "latam")[];
        data_types: ("pii" | "payment" | "phi" | "business" | "files" | "logs" | "credentials" | "biometric")[];
        trust_criteria: ("security" | "availability" | "confidentiality" | "integrity" | "privacy")[];
        frameworks: {
            code: string;
            name: string;
            contracted_at: string;
            status: string;
            catalog_version: number;
            evaluation_period: string;
        }[];
        regulations: import("../domain/entities/service.entity").ServiceRegulationRef[];
        subservice_organizations: {
            id: string;
            type: "on_premise" | "hybrid" | "other" | "aws" | "azure" | "gcp" | "mobile";
            provider: string | null;
            service_provided: string | null;
            responsibility: string | null;
        }[];
        previous_certification: "none" | "soc2" | "soc1" | "iso27001" | null;
        expected_availability: "24x7" | "business_hours" | "on_demand" | "not_applicable";
        system_description: import("../domain/entities/service.entity").SystemDescriptionView | null;
        catalog: {
            status: "ready";
            applicable_requirements: number;
            cloned_controls: number;
            message: string;
        };
        completion: {
            required_total: number;
            required_filled: number;
            optional_total: number;
            optional_filled: number;
        };
        is_complete: boolean;
        technical_control: {
            deployment_scenario: string | null;
            has_scope: boolean;
            is_complete: boolean;
        };
        created_at: string;
        updated_at: string;
    }>>;
}
