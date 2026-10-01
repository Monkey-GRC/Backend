import { CompanyDetail, CompanyOverview } from '../domain/entities/company-overview';
import { RegisterCompanyResult } from '../application/use-cases/register-company.use-case';
export declare function toRegisteredCompanyResponse(result: RegisterCompanyResult): {
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
};
export declare function toCompanyListItem(overview: CompanyOverview, now?: Date): {
    access_key_status: import("../domain/entities/access-key.entity").AccessKeyStatus | null;
    access_key_expires_at: string | null;
    onboarding_completed: boolean;
    id: string;
    name: string;
    admin_email: string;
    isolation_strategy: import("../domain/entities/company.entity").IsolationStrategy;
    status: import("../domain/entities/company.entity").CompanyStatus;
    created_at: string;
};
export declare function toCompanyDetail(detail: CompanyDetail): {
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
};
