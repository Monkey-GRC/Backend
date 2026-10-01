import type { Request } from 'express';
import type { Principal } from '../../../common/auth/principal';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { CreateCompanyDto } from '../application/dtos/create-company.dto';
import { ListCompaniesQuery } from '../application/dtos/list-companies.query';
import { GetCompanyUseCase } from '../application/use-cases/get-company.use-case';
import { ListCompaniesUseCase } from '../application/use-cases/list-companies.use-case';
import { RegisterCompanyUseCase } from '../application/use-cases/register-company.use-case';
export declare class CompaniesController {
    private readonly registerCompany;
    private readonly listCompanies;
    private readonly getCompany;
    constructor(registerCompany: RegisterCompanyUseCase, listCompanies: ListCompaniesUseCase, getCompany: GetCompanyUseCase);
    create(principal: Principal, dto: CreateCompanyDto, req: Request): Promise<ResponseDto<{
        updated_at: string;
        access_key: {
            id: string;
            code: string;
            status: import("../domain/entities/access-key.entity").AccessKeyStatus;
            expires_at: string;
        };
        id: string;
        name: string;
        admin_email: string;
        isolation_strategy: import("../domain/entities/company.entity").IsolationStrategy;
        status: import("../domain/entities/company.entity").CompanyStatus;
        created_at: string;
    }>>;
    list(principal: Principal, query: ListCompaniesQuery): Promise<ResponseDto<{
        items: {
            access_key_status: import("../domain/entities/access-key.entity").AccessKeyStatus | null;
            access_key_expires_at: string | null;
            onboarding_completed: boolean;
            id: string;
            name: string;
            admin_email: string;
            isolation_strategy: import("../domain/entities/company.entity").IsolationStrategy;
            status: import("../domain/entities/company.entity").CompanyStatus;
            created_at: string;
        }[];
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
    }>>;
    detail(principal: Principal, id: string): Promise<ResponseDto<{
        updated_at: string;
        access_keys: {
            id: string;
            status: import("../domain/entities/access-key.entity").AccessKeyStatus;
            expires_at: string;
            used_at: string | null;
        }[];
        access_key_status: import("../domain/entities/access-key.entity").AccessKeyStatus | null;
        access_key_expires_at: string | null;
        onboarding_completed: boolean;
        id: string;
        name: string;
        admin_email: string;
        isolation_strategy: import("../domain/entities/company.entity").IsolationStrategy;
        status: import("../domain/entities/company.entity").CompanyStatus;
        created_at: string;
    }>>;
}
