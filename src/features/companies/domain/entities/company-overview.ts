import { AccessKey } from './access-key.entity';
import { Company } from './company.entity';

// Lo que Monkey Admin ve de cada empresa: la empresa, su clave vigente y si el cliente ya
// declaró su organización (contracts/modules/monkey-admin.md, campos derivados del listado).
export type CompanyOverview = {
  company: Company;
  currentAccessKey: AccessKey | null;
  onboardingCompleted: boolean;
};

export type CompanyDetail = CompanyOverview & {
  accessKeys: AccessKey[];
};
