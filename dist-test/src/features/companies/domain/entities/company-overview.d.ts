import { AccessKey } from './access-key.entity';
import { Company } from './company.entity';
export type CompanyOverview = {
    company: Company;
    currentAccessKey: AccessKey | null;
    onboardingCompleted: boolean;
};
export type CompanyDetail = CompanyOverview & {
    accessKeys: AccessKey[];
};
